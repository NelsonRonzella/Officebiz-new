import { NextRequest, NextResponse } from "next/server"
import { requireAuth, rateLimitByIp } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessConsultas } from "@/lib/permissions"
import { consultaInpiSchema } from "@/lib/validations"
import { fetchInpiMarca } from "@/lib/inpi"

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

  // More conservative rate limit for INPI scraping
  const rateLimit = await rateLimitByIp("consultas-inpi", 10, 60_000)
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
  }

  const q = req.nextUrl.searchParams.get("q")
  if (!q) {
    return NextResponse.json({ error: "Parâmetro 'q' obrigatório" }, { status: 400 })
  }

  const parsed = consultaInpiSchema.safeParse(q)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const data = await fetchInpiMarca(parsed.data)
  if (!data) {
    return NextResponse.json({ error: "Processo não encontrado no INPI" }, { status: 404 })
  }

  return NextResponse.json(data)
}
