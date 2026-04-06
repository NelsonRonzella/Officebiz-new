import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"
import { ConversationsTable } from "@/components/admin/vendas/conversations-table"

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{
    stage?: string
    aiEnabled?: string
    search?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.SalesConversationWhereInput = {}
  if (params.stage) {
    where.stage = params.stage as Prisma.SalesConversationWhereInput["stage"]
  }
  if (params.aiEnabled === "on") where.aiEnabled = true
  if (params.aiEnabled === "off") where.aiEnabled = false
  if (params.search) {
    where.OR = [
      { leadName: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search } },
      { leadEmail: { contains: params.search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    db.salesConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db.salesConversation.count({ where }),
  ])

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <ConversationsTable
        items={JSON.parse(JSON.stringify(items))}
        total={total}
        page={page}
        limit={limit}
        filters={{
          stage: params.stage,
          aiEnabled: params.aiEnabled,
          search: params.search,
        }}
      />
    </div>
  )
}
