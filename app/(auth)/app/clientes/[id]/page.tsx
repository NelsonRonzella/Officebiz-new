import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canManageClients, getDashboardPath } from "@/lib/permissions"
import { ClientForm } from "@/components/clients/client-form"

interface EditClientePageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientePage({ params }: EditClientePageProps) {
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

  if (!canManageClients(currentUser.role)) {
    redirect(getDashboardPath(currentUser.role))
  }

  const { id } = await params

  const where: Record<string, unknown> = {
    id,
    role: "CLIENTE",
  }

  // Licenciado can only see their own clients
  if (currentUser.role === "LICENCIADO") {
    where.createdBy = session.user.id
  }

  const client = await db.user.findFirst({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      cpf: true,
      cnpj: true,
    },
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Editar Cliente
        </h1>
        <p className="text-muted-foreground">
          Atualize os dados do cliente.
        </p>
      </div>

      <ClientForm client={client} />
    </div>
  )
}
