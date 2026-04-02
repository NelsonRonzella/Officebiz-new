import { NextRequest, NextResponse } from "next/server"
import { requireAuth, rateLimitByIp } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessConsultas } from "@/lib/permissions"
import { consultaDominioSchema } from "@/lib/validations"
import { fetchDomain } from "@/lib/consultas"

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

  const data = await fetchDomain(parsed.data)
  if (!data) {
    return NextResponse.json({ error: "Domínio não encontrado" }, { status: 404 })
  }

  return NextResponse.json(data)
}
