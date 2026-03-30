import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { UserForm } from "@/components/admin/user-form"

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      cpf: true,
      cnpj: true,
      telefone: true,
      cep: true,
      endereco: true,
      numero: true,
      bairro: true,
      cidade: true,
      estado: true,
    },
  })

  if (!user) {
    notFound()
  }

  const availableRoles = ["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Usuário</h1>
        <p className="text-sm text-muted-foreground">
          {user.name || user.email}
        </p>
      </div>

      <UserForm user={user} availableRoles={availableRoles} />
    </div>
  )
}
