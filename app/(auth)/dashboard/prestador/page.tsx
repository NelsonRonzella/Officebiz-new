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

export default async function PrestadorDashboardPage() {
  const { user } = await requireAuth({
    name: true,
    role: true,
  })

  if (user.role !== "PRESTADOR") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <PageHeader
        title={`Bem-vindo, ${user.name || "Prestador"}!`}
        description="Acompanhe seus pedidos e atividades por aqui."
      />

      {/* Orders placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />
            <CardTitle>Seus Pedidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum pedido atribuído ainda. Pedidos aparecerão aqui quando forem
            disponibilizados.
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
            Como prestador, você receberá pedidos para executar. Acompanhe tudo
            por aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
