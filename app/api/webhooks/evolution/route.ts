import { NextResponse, after } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone, isLidJid, resolveLidToPhone } from "@/lib/sales-phone"
import { handleAiReply } from "@/lib/sales-ai"
import { logError } from "@/lib/error-log"

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
    await logError({
      source: "WEBHOOK",
      message: "Webhook recebeu JSON inválido",
      severity: "WARN",
    })
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (event.event !== "messages.upsert") {
    return NextResponse.json({ ok: true })
  }

  const data = event.data
  if (!data?.key?.remoteJid) {
    return NextResponse.json({ ok: true })
  }

  // [TEMP DEBUG @lid] — remover depois de capturar payload.
  // Loga o evento inteiro stringificado direto no campo `message` (com safe
  // replacer pra BigInt/circular) — assim sobrevive mesmo se a serialização
  // do `context` engasgar dentro do logError.
  if (data.key.remoteJid.endsWith("@lid")) {
    const seen = new WeakSet()
    const safeReplacer = (_key: string, value: unknown) => {
      if (typeof value === "bigint") return value.toString()
      if (typeof value === "object" && value !== null) {
        if (seen.has(value as object)) return "[circular]"
        seen.add(value as object)
      }
      return value
    }
    let raw = ""
    try {
      raw = JSON.stringify(event, safeReplacer)
    } catch (e) {
      raw = `<stringify failed: ${(e as Error).message}>`
    }
    await logError({
      source: "WEBHOOK",
      severity: "WARN",
      message: `[DEBUG @lid] ${raw.slice(0, 1900)}`,
      context: {
        remoteJid: data.key.remoteJid,
        keyKeys: Object.keys(data.key ?? {}),
        dataKeys: Object.keys(data ?? {}),
      },
    })
  }

  if (!isDirectChat(data.key.remoteJid)) {
    return NextResponse.json({ ok: true, skipped: "non-direct" })
  }

  const remoteJid = data.key.remoteJid
  const isLid = isLidJid(remoteJid)
  let lidJid: string | null = null
  let phone: string

  if (isLid) {
    lidJid = remoteJid
    const resolved = await resolveLidToPhone(remoteJid)
    if (resolved) {
      phone = resolved
    } else {
      // Fallback: identifica a conversa pelo próprio LID até conseguirmos
      // resolver. A IA fica desativada porque não dá pra responder pra @lid.
      phone = `lid:${remoteJid.split("@")[0]}`
      await logError({
        source: "WEBHOOK",
        message: "Mensagem recebida com LID não resolvido — IA desativada",
        severity: "WARN",
        context: { remoteJid, lidPhoneKey: phone, pushName: undefined },
      })
    }
  } else {
    phone = normalizePhone(remoteJid)
  }

  if (!phone) return NextResponse.json({ ok: true })

  // LID não resolvido nunca tem IA ativa (não dá pra enviar pra @lid)
  const lidUnresolved = isLid && phone.startsWith("lid:")

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
      lidJid,
      lastMessageAt: new Date(),
      aiEnabled: isText && !lidUnresolved,
    },
    update: {
      lastMessageAt: new Date(),
      ...(lidJid ? { lidJid } : {}),
      ...(isText && !lidUnresolved ? {} : { aiEnabled: false }),
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
      handleAiReply(convo.id).catch(async (err) => {
        await logError({
          source: "AI_REPLY",
          message: `handleAiReply (after) falhou: ${(err as Error).message}`,
          context: { conversationId: convo.id, phone },
        })
      })
    )
  }

  return NextResponse.json({ ok: true })
}
