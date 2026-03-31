import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markAsRead, markAllAsRead } from "@/lib/notifications"
import { notificationReadSchema } from "@/lib/validations"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = notificationReadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    if ("all" in data && data.all === true) {
      await markAllAsRead(session.user.id)
      return NextResponse.json({ success: true })
    }

    if ("id" in data) {
      await markAsRead(data.id, session.user.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Envie { id: string } ou { all: true }" },
      { status: 400 }
    )
  } catch (error) {
    console.error("PATCH /api/notifications/read error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
