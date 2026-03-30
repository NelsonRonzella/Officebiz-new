import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profileSchema } from "@/lib/validations"

export async function PUT(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = profileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: session.user.id },
      data: result.data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar perfil." },
      { status: 500 }
    )
  }
}
