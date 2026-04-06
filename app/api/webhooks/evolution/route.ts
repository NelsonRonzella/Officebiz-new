import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/sales-phone"
import { handleAiReply } from "@/lib/sales-ai"

export async function POST(req: Request) {
  if (req.headers.get("apikey") !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let event: {
    event?: string
    data?: {
      key?: { id?: string; remoteJid?: string; fromMe?: boolean }
      message?: {
        conversation?: string
        extendedTextMessage?: { text?: string }
        [k: string]: unknown
      }
      messageType?: string
    }
  }
  try {
    event = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (event.event !== "messages.upsert") {
    return NextResponse.json({ ok: true })
  }

  const data = event.data
  if (!data?.key?.remoteJid) {
    return NextResponse.json({ ok: true })
  }

  const phone = normalizePhone(data.key.remoteJid)
  if (!phone) return NextResponse.json({ ok: true })

  const evolutionMsgId = data.key.id ?? null
  const fromMe = data.key.fromMe === true

  if (evolutionMsgId) {
    const existing = await db.salesMessage.findUnique({
      where: { evolutionMsgId },
    })
    if (existing) return NextResponse.json({ ok: true, deduped: true })
  }

  const messageType = data.messageType ?? ""
  const isText =
    messageType === "conversation" || messageType === "extendedTextMessage"
  const content = isText
    ? data.message?.conversation ??
      data.message?.extendedTextMessage?.text ??
      ""
    : `[${messageType || "mídia"} recebido]`

  const convo = await db.salesConversation.upsert({
    where: { phone },
    create: {
      phone,
      lastMessageAt: new Date(),
      aiEnabled: isText,
    },
    update: {
      lastMessageAt: new Date(),
      ...(isText ? {} : { aiEnabled: false }),
    },
  })

  if (fromMe) {
    await db.salesMessage.create({
      data: {
        conversationId: convo.id,
        direction: "OUT",
        sender: "ADMIN",
        content,
        evolutionMsgId,
      },
    })
    if (convo.aiEnabled) {
      await db.salesConversation.update({
        where: { id: convo.id },
        data: { aiEnabled: false },
      })
    }
    return NextResponse.json({ ok: true })
  }

  await db.salesMessage.create({
    data: {
      conversationId: convo.id,
      direction: "IN",
      sender: "LEAD",
      content,
      evolutionMsgId,
    },
  })

  if (!isText) {
    return NextResponse.json({ ok: true })
  }

  const fresh = await db.salesConversation.findUnique({
    where: { id: convo.id },
    select: { aiEnabled: true },
  })
  if (fresh?.aiEnabled) {
    handleAiReply(convo.id).catch((err) =>
      console.error("AI reply failed:", err)
    )
  }

  return NextResponse.json({ ok: true })
}
