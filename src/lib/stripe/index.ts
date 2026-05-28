import Stripe from "stripe";
import prisma from "@/lib/db";
import type { SubscriptionPlan } from "@/types";

let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
      _stripe = new Stripe(key);
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly?: string; yearly?: string }> = {
  free: {},
  pro: {
    monthly: process.env.STRIPE_PRO_PRICE_ID || "",
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_PRICE_ID || "",
  },
};

export const PLAN_LIMITS: Record<SubscriptionPlan, { daily: number; fileMB: number; tokens: number }> = {
  free: { daily: 3, fileMB: 5, tokens: 50000 },
  pro: { daily: 30, fileMB: 50, tokens: 500000 },
  premium: { daily: -1, fileMB: 500, tokens: 5000000 },
};

export async function createOrGetStripeCustomer(userId: string, email: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });

  if (sub?.stripeCustomerId) return sub.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
    },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: "pro" | "premium",
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const customerId = await createOrGetStripeCustomer(userId, email);
  const priceId = PLAN_PRICES[plan].monthly;

  if (!priceId) throw new Error("Fiyat bulunamadı");

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  return session.url || "";
}

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub?.stripeCustomerId) throw new Error("Stripe müşteri bulunamadı");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(sub);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(sub);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as SubscriptionPlan;

  if (!userId || !plan) return;

  const limits = PLAN_LIMITS[plan];

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: "active",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      dailySummaryLimit: limits.daily,
      fileSizeLimitMB: limits.fileMB,
      monthlyTokenLimit: limits.tokens,
    },
    update: {
      plan,
      status: "active",
      stripeSubscriptionId: session.subscription as string,
      dailySummaryLimit: limits.daily,
      fileSizeLimitMB: limits.fileMB,
      monthlyTokenLimit: limits.tokens,
    },
  });

  // Record payment
  if (session.amount_total) {
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentIntentId: session.payment_intent as string,
        amount: session.amount_total,
        currency: session.currency || "usd",
        status: "succeeded",
        description: `${plan} plan subscription`,
      },
    });
  }

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: { role: plan === "premium" ? "premium_user" : "pro_user" },
  });
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) return;

  const status = stripeSubscription.status === "active" ? "active" : "past_due";

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: status as never,
      currentPeriodEnd: new Date((stripeSubscription as unknown as Record<string, number>).current_period_end * 1000),
      cancelAtPeriodEnd: (stripeSubscription as unknown as Record<string, boolean>).cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) return;

  const freeLimits = PLAN_LIMITS.free;

  await prisma.subscription.update({
    where: { userId },
    data: {
      plan: "free",
      status: "canceled",
      canceledAt: new Date(),
      dailySummaryLimit: freeLimits.daily,
      fileSizeLimitMB: freeLimits.fileMB,
      monthlyTokenLimit: freeLimits.tokens,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: "free_user" },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "past_due" },
    });
  }
}
