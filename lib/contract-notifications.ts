import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"
import { Resend } from "resend"
import { CLOSER_WHATSAPP } from "@/lib/pricing"

const resend = new Resend(process.env.RESEND_API_KEY)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"

export async function notifyContractExpiring(
  user: { id: string; name: string | null; email: string; telefone: string | null },
  daysRemaining: number
) {
  const title = `Seu contrato expira em ${daysRemaining} dias`
  const message = `Seu contrato OfficeBiz expira em ${daysRemaining} dias. Entre em contato para renovar.`

  // 1) In-app
  await db.notification.create({
    data: {
      userId: user.id,
      title,
      message,
      type: "WARNING",
      link: "/settings/billing",
    },
  })

  // 2) Email
  resend.emails
    .send({
      from: "OfficeBiz <noreply@zella.digital>",
      to: user.email,
      subject: title,
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1E3A5F;">OfficeBiz</h1>
          <p>${message}</p>
          <p>Fale com um especialista: <a href="https://wa.me/${CLOSER_WHATSAPP}">${CLOSER_WHATSAPP}</a></p>
          <a href="${appUrl}/settings/billing" style="display:inline-block;background:#1E3A5F;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;">Ver detalhes</a>
        </div>
      `,
    })
    .catch((err) => console.error("Email contract expiring failed:", err))

  // 3) WhatsApp
  if (user.telefone) {
    sendText(
      user.telefone,
      `⚠️ *OfficeBiz* — ${message} Fale com um especialista: wa.me/${CLOSER_WHATSAPP}`
    ).catch((err) => console.error("WhatsApp contract expiring failed:", err))
  }
}
