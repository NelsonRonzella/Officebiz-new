import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageTutorials, canViewTutorials } from "@/lib/permissions"
import { tutorialSchema } from "@/lib/validations"

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

    if (!canViewTutorials(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }

    const [tutorials, total] = await Promise.all([
      db.tutorial.findMany({
        where,
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.tutorial.count({ where }),
    ])

    const serialized = tutorials.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      products: t.products.map((tp) => tp.product),
    }))

    return NextResponse.json({ tutorials: serialized, total, page, limit })
  } catch (error) {
    console.error("GET /api/tutorials error:", error)
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

    if (!currentUser || !canManageTutorials(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = tutorialSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { productIds, ...tutorialData } = parsed.data

    const tutorial = await db.$transaction(async (tx) => {
      const created = await tx.tutorial.create({
        data: tutorialData,
      })

      if (productIds && productIds.length > 0) {
        await tx.tutorialProduct.createMany({
          data: productIds.map((productId) => ({
            tutorialId: created.id,
            productId,
          })),
        })
      }

      return created
    })

    return NextResponse.json(tutorial, { status: 201 })
  } catch (error) {
    console.error("POST /api/tutorials error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
