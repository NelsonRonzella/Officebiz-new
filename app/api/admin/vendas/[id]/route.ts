import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  return me?.role === "ADMIN" ? session.user.id : null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }
  const { id } = await params
  const convo = await db.salesConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  })
  if (!convo) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  }
  return NextResponse.json(convo)
}

const patchSchema = z.object({
  aiEnabled: z.boolean().optional(),
  leadName: z.string().nullable().optional(),
  leadEmail: z.string().nullable().optional(),
  leadCity: z.string().nullable().optional(),
  stage: z
    .enum([
      "NOVO",
      "QUALIFICANDO",
      "APRESENTADO",
      "AGUARDANDO_PAGAMENTO",
      "PAGO",
      "PERDIDO",
    ])
    .optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
  const updated = await db.salesConversation.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}
