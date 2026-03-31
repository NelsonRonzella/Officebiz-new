import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // Only ADMIN, LICENCIADO, PRESTADOR can upload attachments
    const allowedRoles = ["ADMIN", "LICENCIADO", "PRESTADOR"]
    if (!allowedRoles.includes(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const order = await db.order.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { file, fileName, orderDocumentCategoryId } = body

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Arquivo e nome do arquivo são obrigatórios" },
        { status: 400 }
      )
    }

    // Validate category belongs to this order if provided
    if (orderDocumentCategoryId) {
      const category = await db.orderDocumentCategory.findFirst({
        where: { id: orderDocumentCategoryId, orderId: id },
      })

      if (!category) {
        return NextResponse.json(
          { error: "Categoria de documento não encontrada neste pedido" },
          { status: 404 }
        )
      }
    }

    const attachment = await db.orderAttachment.create({
      data: {
        orderId: id,
        userId: currentUser.id,
        file,
        fileName,
        orderDocumentCategoryId: orderDocumentCategoryId || null,
      },
      include: {
        user: { select: { id: true, name: true } },
        documentCategory: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders/[id]/anexo error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
