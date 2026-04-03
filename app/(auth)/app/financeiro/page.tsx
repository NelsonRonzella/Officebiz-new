import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/require-auth"
import { LicenciadoFinancial } from "@/components/financial/licenciado-financial"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function LicenciadoFinanceiroPage() {
  const { user } = await requireAuth()

  if (user.role !== "LICENCIADO") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Acompanhe suas vendas e lucros"
      />

      <LicenciadoFinancial />
    </div>
  )
}
