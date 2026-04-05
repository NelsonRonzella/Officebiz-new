import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { db } from "@/lib/db"

export async function GET() {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const relayUrl = process.env.INPI_RELAY_URL
  if (!relayUrl) {
    return NextResponse.json({ connected: false })
  }

  try {
    const res = await fetch(`${relayUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    return NextResponse.json({ connected: res.ok })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
