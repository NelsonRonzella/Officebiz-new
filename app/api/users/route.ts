import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageUsers, canManageClients } from "@/lib/permissions"
import { createUserSchema, createClientSchema } from "@/lib/validations"
import { sendInviteEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const active = searchParams.get("active")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Licenciado can only see their own clients
    if (currentUser.role === "LICENCIADO") {
      where.createdBy = currentUser.id
      where.role = "CLIENTE"
    } else {
      // Admin filters
      if (role) {
        where.role = role
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (active !== null && active !== undefined && active !== "") {
      where.active = active === "true"
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          emailVerified: true,
          telefone: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

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

    const body = await req.json()

    // Licenciado can only create CLIENTE
    if (currentUser.role === "LICENCIADO") {
      const parsed = createClientSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }

      const existingUser = await db.user.findUnique({
        where: { email: parsed.data.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Este email já está cadastrado" },
          { status: 409 }
        )
      }

      const user = await db.user.create({
        data: {
          ...parsed.data,
          role: "CLIENTE",
          emailVerified: null,
          createdBy: currentUser.id,
        },
      })

      await sendInviteEmail(user.email, user.name || "")

      return NextResponse.json(user, { status: 201 })
    }

    // Admin can create any role
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: {
        ...parsed.data,
        emailVerified: null,
        createdBy: currentUser.id,
      },
    })

    await sendInviteEmail(user.email, user.name || "")

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("POST /api/users error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
