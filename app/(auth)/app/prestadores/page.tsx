import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManagePrestadores, getDashboardPath } from "@/lib/permissions"
import { PrestadoresList } from "@/components/clients/prestadores-list"

export default async function PrestadoresPage() {
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

  if (!canManagePrestadores(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Prestadores
        </h1>
        <p className="text-muted-foreground">
          Gerencie os prestadores de serviço da sua equipe.
        </p>
      </div>

      <PrestadoresList />
    </div>
  )
}
