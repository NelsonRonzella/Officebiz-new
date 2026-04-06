import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyContractExpiring } from "@/lib/contract-notifications"
import { CONTRACT_EXPIRY_WARNING_DAYS } from "@/lib/pricing"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const horizon = new Date(now)
  horizon.setDate(horizon.getDate() + 31)

  const users = await db.user.findMany({
    where: {
      plan: "PRO",
      contractEndsAt: { gte: now, lte: horizon },
    },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      contractEndsAt: true,
      contractExpiryNotified: true,
    },
  })

  let notified = 0

  for (const user of users) {
    if (!user.contractEndsAt) continue
    const daysRemaining = Math.ceil(
      (user.contractEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const match = CONTRACT_EXPIRY_WARNING_DAYS.find((d) => d === daysRemaining)
    if (!match) continue

    const notifiedMap =
      (user.contractExpiryNotified as Record<string, boolean> | null) || {}
    if (notifiedMap[String(match)]) continue

    await notifyContractExpiring(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        telefone: user.telefone,
      },
      match
    )

    await db.user.update({
      where: { id: user.id },
      data: {
        contractExpiryNotified: { ...notifiedMap, [String(match)]: true },
      },
    })
    notified++
  }

  return NextResponse.json({ checked: users.length, notified })
}
