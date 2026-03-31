import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageProducts } from "@/lib/permissions"

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

    if (!currentUser || !canManageProducts(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const product = await db.product.findUnique({
      where: { id },
      select: { active: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const updated = await db.product.update({
      where: { id },
      data: { active: !product.active },
      select: {
        id: true,
        name: true,
        active: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/products/[id]/toggle error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
