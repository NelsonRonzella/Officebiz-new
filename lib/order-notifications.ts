import { db } from "@/lib/db"
import { createBulkNotifications } from "@/lib/notifications"
import { sendText } from "@/lib/whatsapp"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderParticipant {
  id: string
  name: string | null
  email: string
  telefone: string | null
  role: string
}

interface NotifyOptions {
  orderId: string
  /** User IDs to EXCLUDE from notifications (e.g. the person who performed the action) */
  excludeUserIds?: string[]
  /** In-app notification */
  title: string
  message: string
  /** Email */
  emailSubject: string
  emailBody: string
  /** WhatsApp */
  whatsappMessage: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOrderParticipants(orderId: string): Promise<OrderParticipant[]> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      criadoPor: true,
      prestadorId: true,
    },
  })

  if (!order) return []

  const uniqueIds = new Set<string>()
  if (order.userId) uniqueIds.add(order.userId)
  if (order.criadoPor) uniqueIds.add(order.criadoPor)
  if (order.prestadorId) uniqueIds.add(order.prestadorId)

  if (uniqueIds.size === 0) return []

  return db.user.findMany({
    where: { id: { in: Array.from(uniqueIds) } },
    select: { id: true, name: true, email: true, telefone: true, role: true },
  })
}

function buildEmailHtml(title: string, body: string, orderId: string): string {
  const orderUrl = `${appUrl}/app/pedidos/${orderId}`
  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
      </div>
      <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
          ${title}
        </p>
        <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          ${body}
        </p>
        <a
          href="${orderUrl}"
          style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
        >
          Ver Pedido
        </a>
      </div>
      <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
        Você recebeu este email porque participa de um pedido na OfficeBiz.
      </p>
    </div>
  `
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export async function notifyOrderParticipants(options: NotifyOptions) {
  const {
    orderId,
    excludeUserIds = [],
    title,
    message,
    emailSubject,
    emailBody,
    whatsappMessage,
  } = options

  const participants = await getOrderParticipants(orderId)
  const excludeSet = new Set(excludeUserIds)
  const targets = participants.filter((p) => !excludeSet.has(p.id))

  if (targets.length === 0) return

  // 1) In-app notifications
  const targetIds = targets.map((p) => p.id)
  createBulkNotifications(
    targetIds,
    title,
    message,
    "ORDER_UPDATE",
    `/app/pedidos/${orderId}`
  ).catch(console.error)

  // 2) Email notifications
  const emailHtml = buildEmailHtml(title, emailBody, orderId)
  for (const target of targets) {
    resend.emails
      .send({
        from: "OfficeBiz <noreply@zella.digital>",
        to: target.email,
        subject: emailSubject,
        html: emailHtml,
      })
      .catch((err) => console.error(`Email to ${target.email} failed:`, err))
  }

  // 3) WhatsApp notifications
  for (const target of targets) {
    if (target.telefone) {
      sendText(target.telefone, whatsappMessage).catch((err) =>
        console.error(`WhatsApp to ${target.telefone} failed:`, err)
      )
    }
  }
}
