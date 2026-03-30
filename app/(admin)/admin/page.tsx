import Link from "next/link"
import { Users, Briefcase, UserCheck } from "lucide-react"
import { db } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { RoleBadge } from "@/components/admin/role-badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const [licenciados, prestadores, clientes, recentUsers] = await Promise.all([
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
  ])

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

      {/* Stats */}
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
                        {user.name || "—"}
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
