import { type ZodType } from "zod/v4"
import { auth } from "@/lib/auth"
import type { Role } from "@prisma/client"
import { headers } from "next/headers"

// ---------------------------------------------------------------------------
// validateBody — parse request body with a Zod schema
// ---------------------------------------------------------------------------
export function validateBody<T>(schema: ZodType<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; error: string; details: unknown } {
  const result = schema.safeParse(body)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: "Dados inválidos",
    details: result.error.issues,
  }
}

// ---------------------------------------------------------------------------
// requireAuth — returns session or null
// ---------------------------------------------------------------------------
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

// ---------------------------------------------------------------------------
// requireRole — checks if the session user's role is in allowedRoles
// ---------------------------------------------------------------------------
export function requireRole(
  session: { user: { role?: string } },
  allowedRoles: Role[],
): boolean {
  const role = session.user.role as Role | undefined
  if (!role) return false
  return allowedRoles.includes(role)
}

// ---------------------------------------------------------------------------
// rateLimitByIp — simple in-memory rate limiter
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries (every 60 seconds)
let cleanupScheduled = false
function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }, 60_000)
}

export async function rateLimitByIp(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  scheduleCleanup()

  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown"
  const storeKey = `${key}:${ip}`

  const now = Date.now()
  const entry = rateLimitStore.get(storeKey)

  if (!entry || now >= entry.resetAt) {
    // New window
    rateLimitStore.set(storeKey, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) {
    return { success: false, remaining: 0 }
  }

  return { success: true, remaining: limit - entry.count }
}
