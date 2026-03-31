import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserNotifications } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const result = await getUserNotifications(
      session.user.id,
      page,
      limit,
      unreadOnly
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/notifications error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
