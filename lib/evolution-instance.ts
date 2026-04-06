// ---------------------------------------------------------------------------
// Evolution API — connected WhatsApp instance number resolver
// ---------------------------------------------------------------------------
//
// Single source of truth for the "Falar com especialista" / WhatsApp links
// across the app. Reads the connected instance from Evolution API and caches
// the result in-process for 5 minutes. Falls back to the static
// CLOSER_WHATSAPP constant if Evolution is unreachable or disconnected.

import { CLOSER_WHATSAPP } from "@/lib/pricing"

const CACHE_TTL_MS = 5 * 60 * 1000
const DEFAULT_MESSAGE = "Olá, quero saber mais sobre o OfficeBiz"

interface CacheEntry {
  number: string
  expiresAt: number
}

let cache: CacheEntry | null = null

function digitsOnly(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.replace(/\D/g, "")
}

function extractNumber(payload: unknown, instanceName: string): string | null {
  if (!payload) return null

  const candidates: unknown[] = Array.isArray(payload) ? payload : [payload]

  // Prefer entry whose name matches our instance, else first.
  const matched =
    candidates.find((entry) => {
      const e = entry as Record<string, unknown> | null
      if (!e) return false
      const inst = e.instance as Record<string, unknown> | undefined
      const name =
        (typeof e.name === "string" && e.name) ||
        (typeof e.instanceName === "string" && e.instanceName) ||
        (inst && typeof inst.instanceName === "string" && inst.instanceName) ||
        (inst && typeof inst.name === "string" && inst.name) ||
        ""
      return name === instanceName
    }) ?? candidates[0]

  if (!matched || typeof matched !== "object") return null
  const entry = matched as Record<string, unknown>
  const inst = (entry.instance as Record<string, unknown> | undefined) ?? {}

  const ownerJid =
    (typeof entry.ownerJid === "string" && entry.ownerJid) ||
    (typeof inst.ownerJid === "string" && (inst.ownerJid as string)) ||
    ""

  if (ownerJid) {
    const stripped = ownerJid.split("@")[0] ?? ""
    const digits = digitsOnly(stripped)
    if (digits) return digits
  }

  const owner =
    (typeof entry.owner === "string" && entry.owner) ||
    (typeof inst.owner === "string" && (inst.owner as string)) ||
    ""
  if (owner) {
    const digits = digitsOnly(owner.split("@")[0] ?? "")
    if (digits) return digits
  }

  const number =
    (typeof entry.number === "string" && entry.number) ||
    (typeof inst.number === "string" && (inst.number as string)) ||
    ""
  if (number) {
    const digits = digitsOnly(number)
    if (digits) return digits
  }

  return null
}

export async function getConnectedWhatsappNumber(): Promise<string> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.number
  }

  const url = (process.env.EVOLUTION_API_URL ?? "").trim().replace(/\/$/, "")
  const key = (process.env.EVOLUTION_API_KEY ?? "").trim()
  const instance = (process.env.EVOLUTION_API_INSTANCE ?? "officebiz").trim()

  let resolved = CLOSER_WHATSAPP

  if (url && key) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5_000)
      const res = await fetch(
        `${url}/instance/fetchInstances?instanceName=${encodeURIComponent(instance)}`,
        {
          method: "GET",
          headers: { apikey: key },
          signal: controller.signal,
        }
      )
      clearTimeout(timeout)

      if (res.ok) {
        const data = (await res.json()) as unknown
        const extracted = extractNumber(data, instance)
        if (extracted) {
          resolved = extracted
        } else {
          console.warn(
            "[evolution-instance] could not extract phone from response; using fallback"
          )
        }
      } else {
        console.warn(
          `[evolution-instance] fetchInstances responded ${res.status}; using fallback`
        )
      }
    } catch (err) {
      console.warn(
        "[evolution-instance] failed to fetch connected number, using fallback:",
        (err as Error).message
      )
    }
  }

  cache = { number: resolved, expiresAt: now + CACHE_TTL_MS }
  return resolved
}

export async function getConnectedWhatsappUrl(text?: string): Promise<string> {
  const number = await getConnectedWhatsappNumber()
  const message = text ?? DEFAULT_MESSAGE
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function invalidateInstanceCache(): void {
  cache = null
}
