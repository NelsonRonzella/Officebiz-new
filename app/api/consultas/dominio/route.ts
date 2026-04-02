import { NextRequest, NextResponse } from "next/server"
import { requireAuth, rateLimitByIp } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessConsultas } from "@/lib/permissions"
import { consultaDominioSchema } from "@/lib/validations"
import { fetchDomain } from "@/lib/consultas"

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

  const rateLimit = await rateLimitByIp("consultas-dominio", 30, 60_000)
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get("q")
  if (!q) {
    return NextResponse.json({ error: "Parâmetro 'q' obrigatório" }, { status: 400 })
  }

  const parsed = consultaDominioSchema.safeParse(q)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Try relay first, fallback to direct
  if (RELAY_URL) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000)
      const relayRes = await fetch(`${RELAY_URL}/dominio?q=${encodeURIComponent(parsed.data)}`, {
        headers: { "X-Relay-Secret": RELAY_SECRET },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await relayRes.json()
      if (relayRes.ok) return NextResponse.json(data)
      if (relayRes.status === 404) {
        return NextResponse.json({ error: "Domínio não encontrado" }, { status: 404 })
      }
    } catch {
      // Relay unavailable, try direct
    }
  }

  // Direct fallback
  const data = await fetchDomain(parsed.data)
  if (!data) {
    return NextResponse.json({ error: "Domínio não encontrado" }, { status: 404 })
  }

  return NextResponse.json(data)
}
