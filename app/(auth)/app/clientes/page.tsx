import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageClients } from "@/lib/permissions"
import { getDashboardPath } from "@/lib/permissions"
import { ClientsList } from "@/components/clients/clients-list"

export default async function ClientesPage() {
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

  if (!canManageClients(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Clientes
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus clientes cadastrados.
        </p>
      </div>

      <ClientsList />
    </div>
  )
}
