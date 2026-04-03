import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/require-auth"
import { canManageClients, getDashboardPath } from "@/lib/permissions"
import { ClientsList } from "@/components/clients/clients-list"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function ClientesPage() {
  const { user } = await requireAuth()

  if (!canManageClients(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes cadastrados."
      />

      <ClientsList />
    </div>
  )
}
