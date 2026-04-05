import { requireAuth } from "@/lib/require-auth"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/app/(auth)/settings/profile/profile-form"

export default async function AdminProfilePage() {
  const { user } = await requireAuth({
    name: true,
    telefone: true,
    companyName: true,
    companyLogo: true,
    companyFavicon: true,
    brandPrimaryColor: true,
    brandAccentColor: true,
    cpf: true,
    cnpj: true,
    cep: true,
    endereco: true,
    numero: true,
    bairro: true,
    cidade: true,
    estado: true,
    role: true,
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
          companyLogo: user.companyLogo ?? "",
          companyFavicon: user.companyFavicon ?? "",
          brandPrimaryColor: user.brandPrimaryColor ?? "",
          brandAccentColor: user.brandAccentColor ?? "",
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
        role={user.role}
      />
    </div>
  )
}
