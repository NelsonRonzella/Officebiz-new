import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/require-auth"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClipboardList, Info } from "lucide-react"

export default async function ClienteDashboardPage() {
  const { user } = await requireAuth({
    name: true,
    role: true,
  })

  if (user.role !== "CLIENTE") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <PageHeader
        title={`Bem-vindo, ${user.name || "Cliente"}!`}
        description="Acompanhe o andamento dos seus serviços por aqui."
      />

      {/* Orders placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <CardTitle>Meus Pedidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Você ainda não tem pedidos. Seus pedidos aparecerão aqui.
          </p>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Info className="size-5 text-primary" />
            <CardTitle>Informação</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Acompanhe o andamento dos seus serviços por aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
