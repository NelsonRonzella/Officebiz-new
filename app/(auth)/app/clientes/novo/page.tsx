import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageClients, getDashboardPath } from "@/lib/permissions"
import { ClientForm } from "@/components/clients/client-form"

export default async function NovoClientePage() {
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
          Novo Cliente
        </h1>
        <p className="text-muted-foreground">
          Preencha os dados para cadastrar um novo cliente.
        </p>
      </div>

      <ClientForm />
    </div>
  )
}
