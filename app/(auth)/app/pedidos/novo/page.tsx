import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canCreateOrders, getDashboardPath } from "@/lib/permissions"
import { OrderForm } from "@/components/orders/order-form"

export default async function NovoPedidoPage() {
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

  if (!canCreateOrders(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  // Load active products
  const products = await db.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
    },
    orderBy: { name: "asc" },
  })

  // Load clients based on role
  const clientsWhere: Record<string, unknown> = {
    role: "CLIENTE",
    active: true,
  }

  if (user.role === "LICENCIADO") {
    clientsWhere.createdBy = session.user.id
  }

  const clients = await db.user.findMany({
    where: clientsWhere,
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  })

  // Serialize Decimal price to string
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price.toString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Novo Pedido
        </h1>
        <p className="text-muted-foreground">
          Crie um novo pedido para um cliente.
        </p>
      </div>

      <OrderForm clients={clients} products={serializedProducts} />
    </div>
  )
}
