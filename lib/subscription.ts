import type { User } from "@prisma/client"
import { db } from "@/lib/db"

export const PLAN_LIMITS = {
  FREE: {
    canAccessDashboard: false,
    canMakeOrders: false,
    canManageClients: false,
  },
  TRIAL: {
    canAccessDashboard: true,
    canMakeOrders: true,
    canManageClients: true,
  },
  PRO: {
    canAccessDashboard: true,
    canMakeOrders: true,
    canManageClients: true,
  },
} as const

export function isTrialActive(user: Pick<User, "plan" | "trialEndsAt">): boolean {
  return user.plan === "TRIAL" && !!user.trialEndsAt && user.trialEndsAt > new Date()
}

export function isSubscribed(user: Pick<User, "plan" | "stripeCurrentPeriodEnd">): boolean {
  return (
    user.plan === "PRO" &&
    !!user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd > new Date()
  )
}

export function hasAccess(
  user: Pick<User, "plan" | "trialEndsAt" | "stripeCurrentPeriodEnd">
): boolean {
  return isTrialActive(user) || isSubscribed(user)
}

export function daysLeftInTrial(user: Pick<User, "trialEndsAt">): number {
  if (!user.trialEndsAt) return 0
  const diff = user.trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Batch-expire trials: sets plan to FREE for users whose trial has ended.
 * Returns the count of expired users.
 */
export async function checkAndExpireTrials(): Promise<number> {
  const result = await db.user.updateMany({
    where: {
      plan: "TRIAL",
      trialEndsAt: { lt: new Date() },
    },
    data: {
      plan: "FREE",
    },
  })
  return result.count
}
