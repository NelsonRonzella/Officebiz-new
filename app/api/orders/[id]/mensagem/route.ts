import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createBulkNotifications } from "@/lib/notifications"

export async function POST(
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

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Only ADMIN, LICENCIADO, PRESTADOR can send messages
    const allowedRoles = ["ADMIN", "LICENCIADO", "PRESTADOR"]
    if (!allowedRoles.includes(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const order = await db.order.findUnique({
      where: { id },
      select: { id: true, userId: true, criadoPor: true, prestadorId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { message, file, fileName } = body

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      )
    }

    const orderMessage = await db.orderMessage.create({
      data: {
        orderId: id,
        userId: currentUser.id,
        message,
        file: file || null,
        fileName: fileName || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    // Notify other participants (not the sender)
    const participantIds = new Set<string>()
    if (order.userId) participantIds.add(order.userId)
    if (order.criadoPor) participantIds.add(order.criadoPor)
    if (order.prestadorId) participantIds.add(order.prestadorId)
    participantIds.delete(currentUser.id) // Don't notify the sender

    if (participantIds.size > 0) {
      createBulkNotifications(
        Array.from(participantIds),
        "Nova mensagem no pedido",
        "Você recebeu uma nova mensagem em um dos seus pedidos.",
        "INFO",
        `/app/pedidos/${id}`
      ).catch(console.error)
    }

    return NextResponse.json(orderMessage, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders/[id]/mensagem error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
