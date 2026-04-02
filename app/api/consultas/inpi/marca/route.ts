import { NextRequest, NextResponse } from "next/server"
import { requireAuth, rateLimitByIp } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessConsultas } from "@/lib/permissions"

const RELAY_URL = process.env.INPI_RELAY_URL
const RELAY_SECRET = process.env.INPI_RELAY_SECRET || "officebiz-inpi-relay-2024"

export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessConsultas(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  if (!RELAY_URL) {
    return NextResponse.json(
      { error: "Consulta INPI temporariamente indisponível." },
      { status: 503 },
    )
  }

  const rateLimit = await rateLimitByIp("consultas-inpi-marca", 10, 60_000)
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get("q")
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Nome da marca deve ter pelo menos 2 caracteres" }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)

    const relayRes = await fetch(`${RELAY_URL}/inpi/marca?q=${encodeURIComponent(q.trim())}`, {
      headers: { "X-Relay-Secret": RELAY_SECRET },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await relayRes.json()
    return NextResponse.json(data, { status: relayRes.status })
  } catch {
    return NextResponse.json(
      { error: "Serviço INPI temporariamente indisponível." },
      { status: 503 },
    )
  }
}
