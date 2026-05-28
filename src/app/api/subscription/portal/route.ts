import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { createBillingPortalSession } from "@/lib/stripe";
import type { JWTPayload } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  return requireAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = await createBillingPortalSession(user.sub, `${appUrl}/billing`);
    return NextResponse.json({ success: true, data: { url } });
  });
}
