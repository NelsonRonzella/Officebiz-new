import { requireAuth } from "@/lib/require-auth"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const { user } = await requireAuth({
    name: true,
    telefone: true,
    companyName: true,
    cpf: true,
    cnpj: true,
    cep: true,
    endereco: true,
    numero: true,
    bairro: true,
    cidade: true,
    estado: true,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Atualize suas informações pessoais."
      />

      <ProfileForm
        initialData={{
          name: user.name ?? "",
          phone: user.telefone ?? "",
          companyName: user.companyName ?? "",
          cpf: user.cpf ?? "",
          cnpj: user.cnpj ?? "",
          telefone: user.telefone ?? "",
          cep: user.cep ?? "",
          endereco: user.endereco ?? "",
          numero: user.numero ?? "",
          bairro: user.bairro ?? "",
          cidade: user.cidade ?? "",
          estado: user.estado ?? "",
        }}
      />
    </div>
  )
}
