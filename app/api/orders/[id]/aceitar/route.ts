import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { startFirstStep } from "@/lib/order-service"
import { createNotification, createBulkNotifications } from "@/lib/notifications"

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
      select: { id: true, role: true },
    })

    if (!currentUser || currentUser.role !== "PRESTADOR") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        product: { select: { type: true } },
        criador: { select: { id: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (order.status !== "PAGO") {
      return NextResponse.json(
        { error: "Pedido não está com status pago" },
        { status: 400 }
      )
    }

    if (order.prestadorId !== null) {
      return NextResponse.json(
        { error: "Pedido já possui um prestador atribuído" },
        { status: 400 }
      )
    }

    const updated = await db.order.update({
      where: { id },
      data: {
        prestadorId: currentUser.id,
        status: "EM_ANDAMENTO",
      },
    })

    // If PONTUAL, start the first step
    if (order.product.type === "PONTUAL") {
      await startFirstStep(order.id)
    }

    // Notify order creator: prestador accepted
    createNotification(
      order.criadoPor,
      "Prestador aceitou o pedido",
      "Um prestador aceitou o seu pedido e o trabalho está em andamento.",
      "SUCCESS",
      `/app/pedidos/${id}`
    ).catch(console.error)

    // Notify admins
    db.user
      .findMany({ where: { role: "ADMIN" }, select: { id: true } })
      .then(async (admins) => {
        const prestador = await db.user.findUnique({
          where: { id: currentUser.id },
          select: { name: true },
        })
        const adminIds = admins.map((a) => a.id)
        if (adminIds.length > 0) {
          createBulkNotifications(
            adminIds,
            "Pedido aceito",
            `Pedido aceito por ${prestador?.name || "prestador"}.`,
            "ORDER_UPDATE",
            `/app/pedidos/${id}`
          )
        }
      })
      .catch(console.error)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/orders/[id]/aceitar error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
