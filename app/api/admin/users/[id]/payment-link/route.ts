import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createLicenseCheckoutSession } from "@/lib/stripe"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      plan: true,
      contractDurationMonths: true,
    },
  })
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }
  if (user.plan !== "PRO") {
    return NextResponse.json({ error: "Usuário não é PRO" }, { status: 400 })
  }

  const months =
    user.contractDurationMonths === 24 || user.contractDurationMonths === 36
      ? user.contractDurationMonths
      : 24

  const checkout = await createLicenseCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    contractDurationMonths: months,
  })

  return NextResponse.json({ url: checkout.url })
}
