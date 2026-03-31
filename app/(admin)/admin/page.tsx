import Link from "next/link"
import {
  Users,
  Briefcase,
  UserCheck,
  DollarSign,
  Clock,
  UserPlus,
} from "lucide-react"
import { db } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { RoleBadge } from "@/components/admin/role-badge"
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts"
import { formatCurrency, getStatusLabel, toNumber } from "@/lib/financial"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    licenciados,
    prestadores,
    clientes,
    recentUsers,
    completedOrders,
    pendingOrdersCount,
    newUsersThisMonth,
    allOrders,
    ordersByStatusRaw,
  ] = await Promise.all([
    db.user.count({ where: { role: "LICENCIADO" } }),
    db.user.count({ where: { role: "PRESTADOR" } }),
    db.user.count({ where: { role: "CLIENTE" } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    }),
    db.order.findMany({
      where: { status: "CONCLUIDO" },
      select: { salePrice: true },
    }),
    db.order.count({
      where: {
        status: { notIn: ["CONCLUIDO", "CANCELADO"] },
      },
    }),
    db.user.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    db.order.findMany({
      select: { createdAt: true, status: true },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ])

  // Calculate total revenue
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + toNumber(o.salePrice),
    0
  )

  // Build orders by month (last 6 months)
  const ordersByMonth: Array<{ month: string; count: number }> = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const monthKey = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    })
    const count = allOrders.filter((o) => {
      const d = new Date(o.createdAt)
      return d >= date && d < nextMonth
    }).length

    ordersByMonth.push({ month: monthKey, count })
  }

  // Build orders by status
  const ordersByStatus = ordersByStatusRaw.map((g) => ({
    status: g.status,
    label: getStatusLabel(g.status),
    count: g._count.id,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Administrativo
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da plataforma
        </p>
      </div>

      {/* Stats - Row 1: Users */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Licenciados"
          value={licenciados}
          icon={Briefcase}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Prestadores"
          value={prestadores}
          icon={UserCheck}
          color="bg-accent/10 text-accent-foreground"
        />
        <StatCard
          title="Total Clientes"
          value={clientes}
          icon={Users}
          color="bg-secondary text-secondary-foreground"
        />
      </div>

      {/* Stats - Row 2: Financial & Orders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="bg-success/10 text-success"
        />
        <StatCard
          title="Pedidos Pendentes"
          value={pendingOrdersCount}
          icon={Clock}
          color="bg-warning/10 text-warning"
        />
        <StatCard
          title="Novos Usuários Este Mês"
          value={newUsersThisMonth}
          icon={UserPlus}
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Charts */}
      <AdminDashboardCharts
        ordersByMonth={ordersByMonth}
        ordersByStatus={ordersByStatus}
      />

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos usuários cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="hidden px-6 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-6 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-foreground">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="hover:underline"
                      >
                        {user.name || "\u2014"}
                      </Link>
                    </td>
                    <td className="hidden px-6 py-3 text-sm text-muted-foreground sm:table-cell">
                      {user.email}
                    </td>
                    <td className="px-6 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex size-2.5 rounded-full ${
                          user.active ? "bg-success" : "bg-muted-foreground/30"
                        }`}
                      />
                    </td>
                    <td className="hidden px-6 py-3 text-sm text-muted-foreground md:table-cell">
                      {user.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
