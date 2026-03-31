import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUnreadCount } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const unreadCount = await getUnreadCount(session.user.id)

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("GET /api/notifications/count error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
