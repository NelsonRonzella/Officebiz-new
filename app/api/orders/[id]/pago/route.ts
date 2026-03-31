import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification, createBulkNotifications } from "@/lib/notifications"
import { sendOrderPaidEmail } from "@/lib/email"

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

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        criadoPor: true,
        userId: true,
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (order.status !== "AGUARDANDO_PAGAMENTO") {
      return NextResponse.json(
        { error: "Pedido não está aguardando pagamento" },
        { status: 400 }
      )
    }

    const updated = await db.order.update({
      where: { id },
      data: { status: "PAGO" },
    })

    // Notify order creator (licenciado): payment confirmed
    createNotification(
      order.criadoPor,
      "Pagamento confirmado",
      "O pagamento do pedido foi confirmado. Aguardando um prestador aceitar.",
      "SUCCESS",
      `/app/pedidos/${id}`
    ).catch(console.error)

    // Notify all prestadores: new order available
    db.user
      .findMany({ where: { role: "PRESTADOR", active: true }, select: { id: true } })
      .then((prestadores) => {
        const ids = prestadores.map((p) => p.id)
        if (ids.length > 0) {
          createBulkNotifications(
            ids,
            "Novo pedido disponível",
            "Um novo pedido pago está disponível para aceitar.",
            "ORDER_UPDATE",
            `/app/pedidos/${id}`
          )
        }
      })
      .catch(console.error)

    // Send email to client about payment confirmation
    sendOrderPaidEmail(order.user.email, {
      clientName: order.user.name || "Cliente",
      productName: order.product.name,
      orderId: id,
    }).catch(console.error)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/orders/[id]/pago error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
