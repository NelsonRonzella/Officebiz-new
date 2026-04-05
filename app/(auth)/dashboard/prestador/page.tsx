import { redirect } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/require-auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/orders/status-badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClipboardList, Clock, CheckCircle2, Package } from "lucide-react"

export default async function PrestadorDashboardPage() {
  const { user } = await requireAuth({
    id: true,
    name: true,
    role: true,
  })

  if (user.role !== "PRESTADOR") {
    redirect("/dashboard")
  }

  const orders = await db.order.findMany({
    where: { prestadorId: user.id },
    select: {
      id: true,
      status: true,
      progresso: true,
      createdAt: true,
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const total = orders.length
  const emAndamento = orders.filter(
    (o) => o.status === "EM_ANDAMENTO" || o.status === "PAGO"
  ).length
  const concluidos = orders.filter((o) => o.status === "CONCLUIDO").length

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bem-vindo, ${user.name || "Prestador"}!`}
        description="Acompanhe seus pedidos e atividades por aqui."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Package className="size-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Pedidos Atribuídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="size-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{emAndamento}</p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="size-8 text-success" />
            <div>
              <p className="text-2xl font-bold">{concluidos}</p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <CardTitle>Seus Pedidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pedido atribuído ainda. Pedidos aparecerão aqui quando forem
              disponibilizados.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/app/pedidos/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {order.user.name || "—"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.progresso > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {order.progresso}%
                      </span>
                    )}
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
