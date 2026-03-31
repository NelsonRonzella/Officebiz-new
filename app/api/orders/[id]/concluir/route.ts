import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import { sendOrderCompletedEmail } from "@/lib/email"

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

    if (order.status !== "EM_ANDAMENTO") {
      return NextResponse.json(
        { error: "Pedido não está em andamento" },
        { status: 400 }
      )
    }

    const updated = await db.order.update({
      where: { id },
      data: {
        status: "CONCLUIDO",
        currentStepId: null,
      },
    })

    // Notify order creator (licenciado)
    createNotification(
      order.criadoPor,
      "Pedido concluído!",
      "O pedido foi marcado como concluído.",
      "SUCCESS",
      `/app/pedidos/${id}`
    ).catch(console.error)

    // Notify client (order.userId) if different from creator
    if (order.userId !== order.criadoPor) {
      createNotification(
        order.userId,
        "Serviço concluído",
        "O serviço do seu pedido foi concluído com sucesso.",
        "SUCCESS",
        `/app/pedidos/${id}`
      ).catch(console.error)
    }

    // Send email to client about order completion
    sendOrderCompletedEmail(order.user.email, {
      clientName: order.user.name || "Cliente",
      productName: order.product.name,
      orderId: id,
    }).catch(console.error)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/orders/[id]/concluir error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
