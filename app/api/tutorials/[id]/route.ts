import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageTutorials, canViewTutorials } from "@/lib/permissions"
import { tutorialSchema } from "@/lib/validations"

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

    if (!canViewTutorials(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const tutorial = await db.tutorial.findUnique({
      where: { id },
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
    })

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial não encontrado" }, { status: 404 })
    }

    const serialized = {
      ...tutorial,
      createdAt: tutorial.createdAt.toISOString(),
      updatedAt: tutorial.updatedAt.toISOString(),
      products: tutorial.products.map((tp) => tp.product),
    }

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("GET /api/tutorials/[id] error:", error)
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

    if (!currentUser || !canManageTutorials(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const existing = await db.tutorial.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Tutorial não encontrado" }, { status: 404 })
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
      const updated = await tx.tutorial.update({
        where: { id },
        data: tutorialData,
      })

      // Re-sync product links
      await tx.tutorialProduct.deleteMany({ where: { tutorialId: id } })
      if (productIds && productIds.length > 0) {
        await tx.tutorialProduct.createMany({
          data: productIds.map((productId) => ({
            tutorialId: id,
            productId,
          })),
        })
      }

      return updated
    })

    return NextResponse.json(tutorial)
  } catch (error) {
    console.error("PUT /api/tutorials/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!currentUser || !canManageTutorials(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const existing = await db.tutorial.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Tutorial não encontrado" }, { status: 404 })
    }

    await db.tutorial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/tutorials/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
