import Link from "next/link"
import { requireAuth } from "@/lib/require-auth"
import { canCreateOrders } from "@/lib/permissions"
import { OrdersList } from "@/components/orders/orders-list"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function PedidosPage() {
  const { user } = await requireAuth()

  const showNewButton = canCreateOrders(user.role)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Visualize e gerencie os pedidos."
        actions={
          showNewButton ? (
            <Button render={<Link href="/app/pedidos/novo" />}>
              <Plus className="mr-2 size-4" />
              Novo pedido
            </Button>
          ) : undefined
        }
      />

      <OrdersList />
    </div>
  )
}
