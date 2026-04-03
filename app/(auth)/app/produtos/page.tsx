import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/require-auth"
import { canViewProducts, canViewProductPrice, getDashboardPath } from "@/lib/permissions"
import { ProductsList } from "@/components/products/products-list"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function ProdutosPage() {
  const { user } = await requireAuth()

  if (!canViewProducts(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  const showPrice = canViewProductPrice(user.role)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos Disponíveis"
        description="Conheça os produtos e serviços oferecidos."
      />

      <ProductsList showPrice={showPrice} />
    </div>
  )
}
