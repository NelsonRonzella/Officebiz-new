import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManagePrestadores, getDashboardPath } from "@/lib/permissions"
import { PrestadorForm } from "@/components/clients/prestador-form"

export default async function NovoPrestadorPage() {
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
          Novo Prestador
        </h1>
        <p className="text-muted-foreground">
          Preencha os dados para cadastrar um novo prestador de serviço.
        </p>
      </div>

      <PrestadorForm />
    </div>
  )
}
