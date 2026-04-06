import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ConversationDetail } from "@/components/admin/vendas/conversation-detail"

export default async function VendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") redirect("/")

  const { id } = await params
  const convo = await db.salesConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 100 } },
  })
  if (!convo) notFound()

  return (
    <div className="p-6">
      <ConversationDetail
        initial={JSON.parse(JSON.stringify(convo))}
      />
    </div>
  )
}
