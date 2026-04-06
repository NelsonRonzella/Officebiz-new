import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  return me?.role === "ADMIN" ? session.user.id : null
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }
  const { id } = await params
  await db.salesMessage.deleteMany({ where: { conversationId: id } })
  const updated = await db.salesConversation.update({
    where: { id },
    data: {
      aiEnabled: true,
      stage: "NOVO",
      leadName: null,
      leadEmail: null,
      leadCity: null,
    },
  })
  return NextResponse.json(updated)
}
