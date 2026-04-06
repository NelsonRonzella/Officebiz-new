import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage") || ""
  const aiEnabled = searchParams.get("aiEnabled") || ""
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.SalesConversationWhereInput = {}
  if (stage) where.stage = stage as Prisma.SalesConversationWhereInput["stage"]
  if (aiEnabled === "on") where.aiEnabled = true
  if (aiEnabled === "off") where.aiEnabled = false
  if (search) {
    where.OR = [
      { leadName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { leadEmail: { contains: search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    db.salesConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.salesConversation.count({ where }),
  ])

  return NextResponse.json({ items, total, page, limit })
}
