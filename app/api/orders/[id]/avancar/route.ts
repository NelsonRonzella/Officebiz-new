import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { advanceStep } from "@/lib/order-service"
import { createNotification } from "@/lib/notifications"

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

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const allowedRoles = ["ADMIN", "LICENCIADO", "PRESTADOR"]
    if (!allowedRoles.includes(currentUser.role)) {
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

    if (order.status !== "EM_ANDAMENTO") {
      return NextResponse.json(
        { error: "Pedido não está em andamento" },
        { status: 400 }
      )
    }

    if (order.product.type !== "PONTUAL") {
      return NextResponse.json(
        { error: "Apenas pedidos pontuais possuem etapas para avançar" },
        { status: 400 }
      )
    }

    const nextStep = await advanceStep(order.id)

    // If no more steps, auto-complete the order
    if (!nextStep) {
      await db.order.update({
        where: { id },
        data: { status: "CONCLUIDO" },
      })
    }

    const updated = await db.order.findUnique({
      where: { id },
      include: {
        currentStep: true,
        steps: { orderBy: { order: "asc" } },
      },
    })

    // Notify order creator about step advancement
    const stepTitle = updated?.currentStep?.title || "próxima etapa"
    createNotification(
      order.criadoPor,
      "Pedido avançou de etapa",
      nextStep
        ? `O pedido avançou para: ${stepTitle}.`
        : "Todas as etapas foram concluídas.",
      "ORDER_UPDATE",
      `/app/pedidos/${id}`
    ).catch(console.error)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/orders/[id]/avancar error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
