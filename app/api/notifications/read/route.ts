import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markAsRead, markAllAsRead } from "@/lib/notifications"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    if (body.all === true) {
      await markAllAsRead(session.user.id)
      return NextResponse.json({ success: true })
    }

    if (body.id && typeof body.id === "string") {
      await markAsRead(body.id, session.user.id)
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
