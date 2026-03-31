import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
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

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await req.json()
    const { prestadorId } = body

    if (!prestadorId) {
      return NextResponse.json(
        { error: "prestadorId é obrigatório" },
        { status: 400 }
      )
    }

    // Validate prestador exists and has the right role
    const prestador = await db.user.findUnique({
      where: { id: prestadorId },
      select: { id: true, role: true },
    })

    if (!prestador) {
      return NextResponse.json({ error: "Prestador não encontrado" }, { status: 404 })
    }

    if (prestador.role !== "PRESTADOR") {
      return NextResponse.json(
        { error: "Usuário informado não é um prestador" },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { id },
      select: { id: true, prestadorId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Update prestador and create log
    const updated = await db.order.update({
      where: { id },
      data: { prestadorId },
    })

    await db.orderPrestadorLog.create({
      data: {
        orderId: id,
        changedById: currentUser.id,
        oldPrestadorId: order.prestadorId,
        newPrestadorId: prestadorId,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/orders/[id]/prestador error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
