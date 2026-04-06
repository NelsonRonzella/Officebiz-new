import { db } from "@/lib/db"
import { SALES_SYSTEM_PROMPT } from "@/lib/sales-ai-prompt"

const TTL_MS = 60_000

let cachedPrompt: string | null = null
let cachedAt = 0

export function invalidateSalesSystemPromptCache(): void {
  cachedPrompt = null
  cachedAt = 0
}

export async function getSalesSystemPrompt(): Promise<string> {
  const now = Date.now()
  if (cachedPrompt !== null && now - cachedAt < TTL_MS) {
    return cachedPrompt
  }
  const row = await db.appSettings.findUnique({ where: { id: "singleton" } })
  const value = row?.salesSystemPrompt?.trim() ? row.salesSystemPrompt : SALES_SYSTEM_PROMPT
  cachedPrompt = value
  cachedAt = now
  return value
}

export async function setSalesSystemPrompt(value: string | null): Promise<void> {
  const normalized = value && value.trim().length > 0 ? value : null
  await db.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", salesSystemPrompt: normalized },
    update: { salesSystemPrompt: normalized },
  })
  invalidateSalesSystemPromptCache()
}

export async function getSalesSystemPromptInfo(): Promise<{ prompt: string; isDefault: boolean }> {
  const row = await db.appSettings.findUnique({ where: { id: "singleton" } })
  const stored = row?.salesSystemPrompt?.trim() ? row.salesSystemPrompt : null
  return {
    prompt: stored ?? SALES_SYSTEM_PROMPT,
    isDefault: stored === null,
  }
}
