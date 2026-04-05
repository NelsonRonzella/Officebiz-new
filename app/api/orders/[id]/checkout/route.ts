import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createOrderCheckoutSession } from "@/lib/stripe"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id: orderId } = await params

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        product: { select: { name: true, price: true } },
        user: { select: { email: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Only the creator (licenciado) or admin can generate checkout
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (
      currentUser?.role !== "ADMIN" &&
      order.criadoPor !== session.user.id
    ) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    if (order.status !== "AGUARDANDO_PAGAMENTO") {
      return NextResponse.json(
        { error: "Pedido já foi pago ou está em outro status" },
        { status: 400 }
      )
    }

    const priceValue = Number(order.salePrice ?? order.product.price)

    const checkoutSession = await createOrderCheckoutSession({
      orderId: order.id,
      productName: order.product.name,
      priceInCents: Math.round(priceValue * 100),
      customerEmail: order.user.email,
    })

    await db.order.update({
      where: { id: orderId },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("POST /api/orders/[id]/checkout error:", error)
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento" },
      { status: 500 }
    )
  }
}
