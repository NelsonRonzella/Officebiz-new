import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClipboardList, Info } from "lucide-react"

export default async function ClienteDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "CLIENTE") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Bem-vindo, {user.name || "Cliente"}!
          </CardTitle>
          <CardDescription>
            Acompanhe o andamento dos seus serviços por aqui.
          </CardDescription>
        </CardHeader>
      </Card>

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
