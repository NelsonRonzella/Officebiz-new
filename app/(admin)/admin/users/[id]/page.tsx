import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { UserForm } from "@/components/admin/user-form"
import { GeneratePaymentLinkButton } from "@/components/admin/generate-payment-link-button"
import { getConnectedWhatsappNumber } from "@/lib/evolution-instance"

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
      slug: true,
      cpf: true,
      cnpj: true,
      telefone: true,
      cep: true,
      endereco: true,
      numero: true,
      bairro: true,
      cidade: true,
      estado: true,
      plan: true,
    },
  })

  if (!user) {
    notFound()
  }

  const availableRoles = ["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]
  const fallbackWhatsapp = await getConnectedWhatsappNumber()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Usuário</h1>
        <p className="text-sm text-muted-foreground">
          {user.name || user.email}
        </p>
      </div>

      <UserForm user={user} availableRoles={availableRoles} />

      {user.plan === "PRO" && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Link de Pagamento</h2>
          <GeneratePaymentLinkButton
            userId={user.id}
            userPhone={user.telefone}
            fallbackWhatsapp={fallbackWhatsapp}
          />
        </div>
      )}
    </div>
  )
}
