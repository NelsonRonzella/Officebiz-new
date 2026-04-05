import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, phone, companyName, companyLogo } = body

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        telefone: phone,
        companyName,
        companyLogo,
        onboardingCompleted: true,
      },
      select: { role: true },
    })

    return NextResponse.json({ success: true, role: updatedUser.role })
  } catch (error) {
    console.error("Onboarding update error:", error)
    return NextResponse.json(
      { error: "Erro ao salvar dados." },
      { status: 500 }
    )
  }
}
