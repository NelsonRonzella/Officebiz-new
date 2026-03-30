import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, stripeCustomerId: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const checkoutSession = await createCheckoutSession(
    user.id,
    user.email,
    user.stripeCustomerId
  )

  return NextResponse.json({ url: checkoutSession.url })
}
