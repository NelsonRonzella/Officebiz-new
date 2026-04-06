import { NextResponse, after } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/sales-phone"
import { handleAiReply } from "@/lib/sales-ai"

// Ignora JIDs que não são conversas 1:1 (grupos, status, broadcast).
function isDirectChat(remoteJid: string): boolean {
  return (
    !remoteJid.endsWith("@g.us") &&
    !remoteJid.endsWith("@broadcast") &&
    remoteJid !== "status@broadcast"
  )
}

// Conjunto ampliado de tipos de mensagem de texto que a Evolution emite.
const TEXT_MESSAGE_TYPES = new Set([
  "conversation",
  "extendedTextMessage",
  "textMessage",
  "ephemeralMessage",
])

export async function POST(req: Request) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET
  const url = new URL(req.url)
  const providedSecret =
    url.searchParams.get("secret") || req.headers.get("apikey")
  if (!secret || providedSecret !== secret) {
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

  if (!isDirectChat(data.key.remoteJid)) {
    return NextResponse.json({ ok: true, skipped: "non-direct" })
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
  const isText = TEXT_MESSAGE_TYPES.has(messageType)
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
    // Echo da própria IA: a Evolution reenvia toda mensagem enviada via API
    // como webhook fromMe=true. Se a última mensagem OUT recente for da IA com
    // o mesmo conteúdo, ignoramos para não duplicar nem desligar aiEnabled.
    const recentAiEcho = await db.salesMessage.findFirst({
      where: {
        conversationId: convo.id,
        direction: "OUT",
        sender: "AI",
        content,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    })
    if (recentAiEcho) {
      return NextResponse.json({ ok: true, echo: true })
    }

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
    // Responde 200 imediatamente para a Evolution não dar timeout/retry,
    // mas garante a execução no Vercel via after() (waitUntil).
    after(
      handleAiReply(convo.id).catch((err) => {
        console.error("AI reply failed:", err)
      })
    )
  }

  return NextResponse.json({ ok: true })
}
