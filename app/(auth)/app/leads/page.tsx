import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/require-auth"
import { canAccessBuscadorLeads, getDashboardPath } from "@/lib/permissions"
import { BuscadorLeads } from "@/components/leads/buscador-leads"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function LeadsPage() {
  const { user } = await requireAuth()

  if (!canAccessBuscadorLeads(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buscador de Leads"
        description="Encontre empresas por segmento e localização."
      />
      <BuscadorLeads />
    </div>
  )
}
