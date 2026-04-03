import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessWhatsApp } from "@/lib/permissions"
import { checkInstanceStatus } from "@/lib/whatsapp"

export async function GET() {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessWhatsApp(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const status = await checkInstanceStatus()
  return NextResponse.json(status)
}
