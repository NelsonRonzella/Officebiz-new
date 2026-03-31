import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function canViewOrder(
  order: { userId: string; criadoPor: string; prestadorId: string | null; status: string },
  user: { id: string; role: string }
): boolean {
  if (user.role === "ADMIN") return true
  if (user.role === "LICENCIADO") return order.criadoPor === user.id
  if (user.role === "PRESTADOR")
    return order.prestadorId === user.id || (order.prestadorId === null && order.status === "PAGO")
  if (user.role === "CLIENTE") return order.userId === user.id
  return false
}

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

    const order = await db.order.findUnique({
      where: { id },
      include: {
        product: true,
        user: { select: { id: true, name: true, email: true } },
        criador: { select: { id: true, name: true } },
        prestador: { select: { id: true, name: true } },
        currentStep: true,
        steps: { orderBy: { order: "asc" } },
        documentCategories: {
          orderBy: { order: "asc" },
          include: {
            attachments: {
              include: { user: { select: { id: true, name: true } } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        prestadorLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: { select: { id: true, name: true } },
            oldPrestador: { select: { id: true, name: true } },
            newPrestador: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (!canViewOrder(order, currentUser)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
