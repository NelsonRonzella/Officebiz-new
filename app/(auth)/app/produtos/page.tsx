import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canViewProducts, canViewProductPrice, getDashboardPath } from "@/lib/permissions"
import { ProductsList } from "@/components/products/products-list"

export default async function ProdutosPage() {
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

  if (!canViewProducts(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  const showPrice = canViewProductPrice(user.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Produtos Disponíveis
        </h1>
        <p className="text-muted-foreground">
          Conheça os produtos e serviços oferecidos.
        </p>
      </div>

      <ProductsList showPrice={showPrice} />
    </div>
  )
}
