import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifyOrderParticipants } from "@/lib/order-notifications"
import { orderMessageSchema } from "@/lib/validations"

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

    // Only ADMIN, LICENCIADO, PRESTADOR, CLIENTE can send messages
    const allowedRoles = ["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]
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

    const contentType = req.headers.get("content-type") || ""

    let message: string
    let file: string | null = null
    let fileName: string | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      message = (formData.get("message") as string) || ""
      const fileEntry = formData.get("file") as File | null
      if (fileEntry && fileEntry.size > 0) {
        // Convert file to base64 data URL for storage
        const bytes = await fileEntry.arrayBuffer()
        const base64 = Buffer.from(bytes).toString("base64")
        file = `data:${fileEntry.type};base64,${base64}`
        fileName = fileEntry.name
      }
    } else {
      const body = await req.json()
      const parsed = orderMessageSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: parsed.error.issues },
          { status: 400 }
        )
      }
      message = parsed.data.message
      file = parsed.data.file || null
      fileName = parsed.data.fileName || null
    }

    if (!message.trim() && !file) {
      return NextResponse.json(
        { error: "Mensagem ou arquivo é obrigatório" },
        { status: 400 }
      )
    }

    const orderMessage = await db.orderMessage.create({
      data: {
        orderId: id,
        userId: currentUser.id,
        message: message.trim(),
        file,
        fileName,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    // Notify other participants (not the sender)
    const senderName = orderMessage.user.name || "Alguém"
    notifyOrderParticipants({
      orderId: id,
      excludeUserIds: [currentUser.id],
      title: "Nova mensagem no pedido",
      message: `${senderName} enviou uma nova mensagem no pedido.`,
      emailSubject: "Nova mensagem no seu pedido — OfficeBiz",
      emailBody: `${senderName} enviou uma nova mensagem em um dos seus pedidos. Acesse a plataforma para visualizar.`,
      whatsappMessage: `📩 *OfficeBiz* — ${senderName} enviou uma nova mensagem no seu pedido. Acesse: ${process.env.NEXT_PUBLIC_APP_URL || "https://officebiz.com.br"}/app/pedidos/${id}`,
    }).catch(console.error)

    return NextResponse.json(orderMessage, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders/[id]/mensagem error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
