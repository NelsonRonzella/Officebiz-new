// ---------------------------------------------------------------------------
// Evolution API client — central WhatsApp integration
// ---------------------------------------------------------------------------

import { logError } from "@/lib/error-log"

interface SendResult {
  success: boolean
  error?: string
  messageId?: string
}

interface InstanceStatus {
  connected: boolean
  number?: string
}

interface QrCodeResult {
  qrcode: string | null
}

function getConfig() {
  return {
    url: (process.env.EVOLUTION_API_URL ?? "").trim().replace(/\/$/, ""),
    key: (process.env.EVOLUTION_API_KEY ?? "").trim(),
    instance: (process.env.EVOLUTION_API_INSTANCE ?? "officebiz").trim(),
  }
}

function isConfigured(): boolean {
  const { url, key } = getConfig()
  return Boolean(url && key)
}

async function evolutionFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const { url, key } = getConfig()
  if (!url || !key) {
    await logError({
      source: "EVOLUTION_CONNECTION",
      message: "Evolution API não configurada (URL/KEY ausente)",
      context: { hasUrl: !!url, hasKey: !!key, path },
    })
    return null
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(`${url}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        ...options.headers,
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res
  } catch (err) {
    await logError({
      source: "EVOLUTION_CONNECTION",
      message: `Falha de conexão com Evolution API: ${(err as Error).message}`,
      context: { path },
    })
    return null
  }
}

export async function sendText(phone: string, message: string): Promise<SendResult> {
  if (!isConfigured()) return { success: false, error: "WhatsApp não configurado" }

  const { instance } = getConfig()
  const res = await evolutionFetch(`/message/sendText/${instance}`, {
    method: "POST",
    body: JSON.stringify({
      number: phone,
      text: message,
    }),
  })

  if (!res) return { success: false, error: "Falha na conexão com Evolution API" }
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    await logError({
      source: "WHATSAPP_SEND",
      message: `sendText falhou: ${res.status}`,
      context: { phone, status: res.status, body: body.slice(0, 1000), messagePreview: message.slice(0, 200) },
    })
    return { success: false, error: `Evolution API: ${res.status} ${body}`.trim() }
  }

  let messageId: string | undefined
  try {
    const data = (await res.json()) as { key?: { id?: string } }
    messageId = data?.key?.id ?? undefined
  } catch {
    // ignore — sucesso sem id ainda é sucesso
  }

  return { success: true, messageId }
}

export async function sendMedia(
  phone: string,
  mediaUrl: string,
  caption: string,
  mediatype: "image" | "document" = "image"
): Promise<SendResult> {
  if (!isConfigured()) return { success: false, error: "WhatsApp não configurado" }

  const { instance } = getConfig()
  const res = await evolutionFetch(`/message/sendMedia/${instance}`, {
    method: "POST",
    body: JSON.stringify({ number: phone, mediatype, media: mediaUrl, caption }),
  })

  if (!res) return { success: false, error: "Falha na conexão com Evolution API" }
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    await logError({
      source: "WHATSAPP_SEND",
      message: `sendMedia falhou: ${res.status}`,
      context: { phone, status: res.status, body: body.slice(0, 1000), mediaUrl, mediatype },
    })
    return { success: false, error: `Evolution API: ${res.status}` }
  }

  return { success: true }
}

export async function checkInstanceStatus(): Promise<InstanceStatus> {
  const { instance } = getConfig()
  const res = await evolutionFetch(`/instance/connectionState/${instance}`)

  if (!res || !res.ok) return { connected: false }

  try {
    const data = await res.json()
    const state = data?.instance?.state ?? data?.state
    const connected = state === "open"
    const number = data?.instance?.ownerJid?.split("@")?.[0] ?? undefined
    return { connected, number }
  } catch {
    return { connected: false }
  }
}

export async function getQrCode(): Promise<QrCodeResult> {
  const { instance } = getConfig()
  const res = await evolutionFetch(`/instance/connect/${instance}`)

  if (!res || !res.ok) return { qrcode: null }

  try {
    const data = await res.json()
    const qrcode = data?.base64 ?? data?.qrcode ?? null
    return { qrcode }
  } catch {
    return { qrcode: null }
  }
}
