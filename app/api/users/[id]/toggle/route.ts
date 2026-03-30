import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canToggleUsers } from "@/lib/permissions"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!currentUser || !canToggleUsers(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { active: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = await db.user.update({
      where: { id },
      data: { active: !targetUser.active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("PATCH /api/users/[id]/toggle error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
