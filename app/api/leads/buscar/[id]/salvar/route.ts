import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessBuscadorLeads } from "@/lib/permissions"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessBuscadorLeads(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params

  const lead = await db.leadBuscado.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!lead || lead.userId !== session.user.id) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
  }

  await db.leadBuscado.update({
    where: { id },
    data: { salvo: true, ignorado: false },
  })

  return NextResponse.json({ success: true })
}
