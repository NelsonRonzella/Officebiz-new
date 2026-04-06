import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Prisma, SystemErrorSource } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) }
  }
  return { ok: true as const }
}

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error

  const { searchParams } = new URL(req.url)
  const source = searchParams.get("source") || ""
  const severity = searchParams.get("severity") || ""
  const resolved = searchParams.get("resolved") || ""
  const range = searchParams.get("range") || "7d"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 30
  const skip = (page - 1) * limit

  const where: Prisma.SystemErrorWhereInput = {}
  if (source) where.source = source as SystemErrorSource
  if (severity === "ERROR" || severity === "WARN") where.severity = severity
  if (resolved === "true") where.resolved = true
  if (resolved === "false") where.resolved = false

  const rangeMs: Record<string, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }
  if (rangeMs[range]) {
    where.createdAt = { gte: new Date(Date.now() - rangeMs[range]) }
  }

  const [items, total, unresolvedCount] = await Promise.all([
    db.systemError.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.systemError.count({ where }),
    db.systemError.count({ where: { resolved: false } }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: limit,
    unresolvedCount,
  })
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error

  const body = await req.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : null
  const resolved = typeof body?.resolved === "boolean" ? body.resolved : null
  if (!id || resolved === null) {
    return NextResponse.json({ error: "id e resolved obrigatórios" }, { status: 400 })
  }

  const updated = await db.systemError.update({
    where: { id },
    data: { resolved },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return guard.error

  const { searchParams } = new URL(req.url)
  const scope = searchParams.get("scope") || ""

  if (scope === "resolved") {
    const result = await db.systemError.deleteMany({ where: { resolved: true } })
    return NextResponse.json({ deleted: result.count })
  }
  return NextResponse.json({ error: "scope inválido" }, { status: 400 })
}
