import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManagePrestadores, getDashboardPath } from "@/lib/permissions"
import { PrestadorForm } from "@/components/clients/prestador-form"

interface EditPrestadorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPrestadorPage({ params }: EditPrestadorPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!currentUser) {
    redirect("/login")
  }

  if (!canManagePrestadores(currentUser.role)) {
    redirect(getDashboardPath(currentUser.role))
  }

  const { id } = await params

  const prestador = await db.user.findFirst({
    where: {
      id,
      role: "PRESTADOR",
      createdBy: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      cpf: true,
      cnpj: true,
    },
  })

  if (!prestador) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Editar Prestador
        </h1>
        <p className="text-muted-foreground">
          Atualize os dados do prestador de serviço.
        </p>
      </div>

      <PrestadorForm prestador={prestador} />
    </div>
  )
}
