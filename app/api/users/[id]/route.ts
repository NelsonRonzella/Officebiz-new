import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageUsers } from "@/lib/permissions"
import { updateUserSchema } from "@/lib/validations"

export async function GET(
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
      select: { id: true, role: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        cpf: true,
        cnpj: true,
        telefone: true,
        cep: true,
        endereco: true,
        numero: true,
        bairro: true,
        cidade: true,
        estado: true,
        emailVerified: true,
        createdBy: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Licenciado can only see their own clients
    if (currentUser.role === "LICENCIADO") {
      if (user.createdBy !== currentUser.id || user.role !== "CLIENTE") {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    } else if (!canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/users/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
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
      select: { id: true, role: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, createdBy: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Licenciado can only update their own clients
    if (currentUser.role === "LICENCIADO") {
      if (targetUser.createdBy !== currentUser.id || targetUser.role !== "CLIENTE") {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    } else if (!canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
