import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canCreateOrders, getDashboardPath } from "@/lib/permissions"
import { OrdersList } from "@/components/orders/orders-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function PedidosPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) {
    redirect("/login")
  }

  const showNewButton = canCreateOrders(user.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pedidos
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os pedidos.
          </p>
        </div>

        {showNewButton && (
          <Button render={<Link href="/app/pedidos/novo" />}>
            <Plus className="mr-2 size-4" />
            Novo pedido
          </Button>
        )}
      </div>

      <OrdersList />
    </div>
  )
}
