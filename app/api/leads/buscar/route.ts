import { NextRequest, NextResponse } from "next/server"
import { requireAuth, rateLimitByIp } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { canAccessBuscadorLeads } from "@/lib/permissions"
import { buscadorLeadsSchema } from "@/lib/validations"
import { buscarLeads } from "@/lib/leads-buscar"

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || !canAccessBuscadorLeads(user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const rateLimit = await rateLimitByIp("buscador-leads", 5, 60_000)
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = buscadorLeadsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { cidade, estado, segmento, raioKm } = parsed.data

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Buscador não configurado. Contate o administrador." },
      { status: 503 }
    )
  }

  const leads = await buscarLeads(session.user.id, segmento, cidade, estado, raioKm)

  return NextResponse.json({ leads })
}
