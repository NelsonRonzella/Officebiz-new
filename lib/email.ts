import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOtpEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Seu código de acesso: ${code}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #64748B; font-size: 14px; margin: 0 0 8px;">Seu código de acesso:</p>
          <p style="color: #1E3A5F; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0 0 16px;">${code}</p>
          <p style="color: #64748B; font-size: 13px; margin: 0;">Este código expira em 10 minutos.</p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Se você não solicitou este código, ignore este email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
