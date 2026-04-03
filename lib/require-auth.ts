import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Session } from "next-auth"
import type { Prisma } from "@prisma/client"

interface AuthSession extends Session {
  user: Session["user"] & { id: string }
}

export async function requireAuth<T extends Prisma.UserSelect = { role: true }>(
  select?: T
) {
  const session = (await auth()) as AuthSession | null
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: (select ?? { role: true }) as T,
  })
  if (!user) redirect("/login")

  return { session, user: user as NonNullable<typeof user> }
}
