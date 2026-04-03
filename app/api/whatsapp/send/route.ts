import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessWhatsApp } from "@/lib/permissions"
import { whatsappSendSchema } from "@/lib/validations"
import { sendText } from "@/lib/whatsapp"

export async function POST(req: NextRequest) {
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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = whatsappSendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const result = await sendText(parsed.data.phone, parsed.data.message)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Falha ao enviar" },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
