import { UserForm } from "@/components/admin/user-form"

export default function AdminNewUserPage() {
  const availableRoles = ["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Novo Usuário</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para criar um novo usuário
        </p>
      </div>

      <UserForm availableRoles={availableRoles} />
    </div>
  )
}
