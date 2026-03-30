import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageUsers, canManageClients } from "@/lib/permissions"
import { sendInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (!canManageUsers(currentUser.role) && !canManageClients(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdBy: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Licenciado can only resend invite to their own clients
    if (currentUser.role === "LICENCIADO") {
      if (user.createdBy !== currentUser.id || user.role !== "CLIENTE") {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    await sendInviteEmail(user.email, user.name || "")

    return NextResponse.json({ message: "Convite reenviado com sucesso" })
  } catch (error) {
    console.error("POST /api/users/invite error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
