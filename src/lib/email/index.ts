import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "Smart Summarizer AI <noreply@smartsummarizer.ai>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "E-posta adresinizi doğrulayın - Smart Summarizer AI",
    html: emailTemplate({
      title: "E-posta Doğrulama",
      preheader: "Hesabınızı aktifleştirmek için e-postanızı doğrulayın",
      content: `
        <p>Merhaba,</p>
        <p>Smart Summarizer AI'ya hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın.</p>
        <p>Bu link 24 saat geçerlidir.</p>
      `,
      buttonText: "E-postamı Doğrula",
      buttonUrl: verifyUrl,
    }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Şifre Sıfırlama - Smart Summarizer AI",
    html: emailTemplate({
      title: "Şifre Sıfırlama",
      preheader: "Şifrenizi sıfırlamak için bu e-postayı kullanın",
      content: `
        <p>Merhaba,</p>
        <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyin.</p>
        <p>Bu link 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
      `,
      buttonText: "Şifremi Sıfırla",
      buttonUrl: resetUrl,
    }),
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Smart Summarizer AI'ya Hoş Geldiniz! 🎉",
    html: emailTemplate({
      title: `Hoş Geldiniz, ${name}!`,
      preheader: "Yapay zeka destekli özetleme platformunuza hoş geldiniz",
      content: `
        <p>Merhaba ${name},</p>
        <p>Smart Summarizer AI ailesine katıldığınız için teşekkürler!</p>
        <p>Artık PDF'lerinizi, dökümanlarınızı, ses dosyalarınızı ve daha fazlasını yapay zeka ile analiz edebilirsiniz.</p>
        <ul>
          <li>✅ Günde 3 ücretsiz özet</li>
          <li>✅ 6 farklı analiz modu</li>
          <li>✅ Quiz ve Flashcard oluşturma</li>
        </ul>
      `,
      buttonText: "Hemen Başla",
      buttonUrl: `${APP_URL}/dashboard`,
    }),
  });
}

function emailTemplate({
  title,
  preheader,
  content,
  buttonText,
  buttonUrl,
}: {
  title: string;
  preheader: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
</head>
<body style="margin:0;padding:0;background:#020810;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020810;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:2px;border-radius:16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#060f1e;border-radius:14px;">
                <tr>
                  <td style="padding:40px;">
                    <div style="text-align:center;margin-bottom:32px;">
                      <div style="background:linear-gradient(135deg,#00d4ff,#7c3aed);display:inline-block;padding:12px 24px;border-radius:30px;color:white;font-weight:700;font-size:18px;">
                        Smart Summarizer AI
                      </div>
                    </div>
                    <h1 style="color:#e8f0ff;font-size:24px;font-weight:700;margin:0 0 24px;text-align:center;">${title}</h1>
                    <div style="color:#8899bb;font-size:15px;line-height:1.7;">${content}</div>
                    ${
                      buttonText && buttonUrl
                        ? `
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${buttonUrl}" style="background:linear-gradient(135deg,#00d4ff,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">${buttonText}</a>
                    </div>
                    `
                        : ""
                    }
                    <p style="color:#4a5f80;font-size:12px;text-align:center;margin-top:32px;">
                      Bu e-postayı beklemediniz mi? Güvenle görmezden gelebilirsiniz.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding-top:24px;color:#4a5f80;font-size:12px;">
              © ${new Date().getFullYear()} Smart Summarizer AI. Tüm hakları saklıdır.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
