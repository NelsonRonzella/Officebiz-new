import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageProducts, canViewProducts } from "@/lib/permissions"
import { pontualProductSchema, recorrenteProductSchema } from "@/lib/validations"

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

    if (!canViewProducts(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const active = searchParams.get("active")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Non-admin users can only see active products
    if (currentUser.role !== "ADMIN") {
      where.active = true
    } else if (active !== null && active !== undefined && active !== "") {
      where.active = active === "true"
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          _count: {
            select: {
              steps: true,
              documentCategories: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

    return NextResponse.json({ products: serialized, total, page, limit })
  } catch (error) {
    console.error("GET /api/products error:", error)
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

    if (!currentUser || !canManageProducts(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json()

    if (body.type === "PONTUAL") {
      const parsed = pontualProductSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }

      const { steps, tutorialIds, ...productData } = parsed.data

      const product = await db.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            type: "PONTUAL",
            steps: {
              create: steps.map((step, index) => ({
                title: step.title,
                description: step.description,
                durationDays: step.durationDays,
                order: index,
              })),
            },
          },
        })

        if (tutorialIds && tutorialIds.length > 0) {
          await tx.tutorialProduct.createMany({
            data: tutorialIds.map((tutorialId) => ({
              tutorialId,
              productId: created.id,
            })),
          })
        }

        return created
      })

      return NextResponse.json(product, { status: 201 })
    }

    if (body.type === "RECORRENTE") {
      const parsed = recorrenteProductSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }

      const { categories, tutorialIds, ...productData } = parsed.data

      const product = await db.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            type: "RECORRENTE",
            documentCategories: {
              create: categories.map((cat, index) => ({
                title: cat.title,
                description: cat.description,
                order: index,
              })),
            },
          },
        })

        if (tutorialIds && tutorialIds.length > 0) {
          await tx.tutorialProduct.createMany({
            data: tutorialIds.map((tutorialId) => ({
              tutorialId,
              productId: created.id,
            })),
          })
        }

        return created
      })

      return NextResponse.json(product, { status: 201 })
    }

    return NextResponse.json(
      { error: "Tipo de produto inválido" },
      { status: 400 }
    )
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
