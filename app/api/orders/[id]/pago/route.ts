import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifyOrderParticipants } from "@/lib/order-notifications"

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

    // Notify all participants except the admin who marked as paid
    notifyOrderParticipants({
      orderId: id,
      excludeUserIds: [currentUser.id],
      title: "Pagamento confirmado",
      message: `O pagamento do pedido para ${order.product.name} foi confirmado.`,
      emailSubject: `Pagamento confirmado — ${order.product.name}`,
      emailBody: `O pagamento do pedido para <strong>${order.product.name}</strong> foi confirmado. O serviço será iniciado em breve.`,
      whatsappMessage: `💰 *OfficeBiz* — Pagamento confirmado para o pedido "${order.product.name}". Acesse: ${process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"}/app/pedidos/${id}`,
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
