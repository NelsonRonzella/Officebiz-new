import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendText } from "@/lib/whatsapp"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const content = typeof body?.content === "string" ? body.content.trim() : ""
  if (!content) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
  }

  const convo = await db.salesConversation.findUnique({ where: { id } })
  if (!convo) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  }

  await sendText(convo.phone, content)

  await db.salesConversation.update({
    where: { id },
    data: { aiEnabled: false, lastMessageAt: new Date() },
  })

  const message = await db.salesMessage.create({
    data: {
      conversationId: id,
      direction: "OUT",
      sender: "ADMIN",
      content,
    },
  })

  return NextResponse.json(message)
}
