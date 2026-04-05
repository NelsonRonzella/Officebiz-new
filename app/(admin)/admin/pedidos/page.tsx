import { OrdersList } from "@/components/orders/orders-list"
import { PageHeader } from "@/components/dashboard/page-header"

export default function AdminPedidosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Visualize e gerencie todos os pedidos da plataforma."
      />

      <OrdersList basePath="/admin/pedidos" />
    </div>
  )
}
