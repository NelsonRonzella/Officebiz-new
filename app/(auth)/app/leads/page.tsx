import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canAccessBuscadorLeads, getDashboardPath } from "@/lib/permissions"
import { BuscadorLeads } from "@/components/leads/buscador-leads"

export default async function LeadsPage() {
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

  if (!canAccessBuscadorLeads(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Buscador de Leads
        </h1>
        <p className="text-muted-foreground">
          Encontre empresas por segmento e localização.
        </p>
      </div>
      <BuscadorLeads />
    </div>
  )
}
