import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageProducts, canViewProducts } from "@/lib/permissions"
import { pontualProductSchema, recorrenteProductSchema } from "@/lib/validations"

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

    if (!canViewProducts(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: "asc" } },
        documentCategories: { orderBy: { order: "asc" } },
        tutorials: {
          include: {
            tutorial: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Non-admin can only see active products
    if (currentUser.role !== "ADMIN" && !product.active) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const serialized = {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      steps: product.steps.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      documentCategories: product.documentCategories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      tutorials: product.tutorials.map((tp) => ({
        id: tp.tutorial.id,
        title: tp.tutorial.title,
        description: tp.tutorial.description,
        link: tp.tutorial.link,
      })),
    }

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
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

    if (!currentUser || !canManageProducts(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const existingProduct = await db.product.findUnique({
      where: { id },
      select: { type: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const body = await req.json()

    if (existingProduct.type === "PONTUAL") {
      const parsed = pontualProductSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }

      const { steps, tutorialIds, ...productData } = parsed.data

      const product = await db.$transaction(async (tx) => {
        // Update product fields
        const updated = await tx.product.update({
          where: { id },
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
          },
        })

        // Delete existing steps and recreate
        await tx.productStep.deleteMany({ where: { productId: id } })
        await tx.productStep.createMany({
          data: steps.map((step, index) => ({
            productId: id,
            title: step.title,
            description: step.description,
            durationDays: step.durationDays,
            order: index,
          })),
        })

        // Re-sync tutorial links
        await tx.tutorialProduct.deleteMany({ where: { productId: id } })
        if (tutorialIds && tutorialIds.length > 0) {
          await tx.tutorialProduct.createMany({
            data: tutorialIds.map((tutorialId) => ({
              tutorialId,
              productId: id,
            })),
          })
        }

        return updated
      })

      return NextResponse.json({ ...product, price: Number(product.price) })
    }

    if (existingProduct.type === "RECORRENTE") {
      const parsed = recorrenteProductSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }

      const { categories, tutorialIds, ...productData } = parsed.data

      const product = await db.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
          },
        })

        // Delete existing categories and recreate
        await tx.productDocumentCategory.deleteMany({ where: { productId: id } })
        await tx.productDocumentCategory.createMany({
          data: categories.map((cat, index) => ({
            productId: id,
            title: cat.title,
            description: cat.description,
            order: index,
          })),
        })

        // Re-sync tutorial links
        await tx.tutorialProduct.deleteMany({ where: { productId: id } })
        if (tutorialIds && tutorialIds.length > 0) {
          await tx.tutorialProduct.createMany({
            data: tutorialIds.map((tutorialId) => ({
              tutorialId,
              productId: id,
            })),
          })
        }

        return updated
      })

      return NextResponse.json({ ...product, price: Number(product.price) })
    }

    return NextResponse.json(
      { error: "Tipo de produto inválido" },
      { status: 400 }
    )
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
