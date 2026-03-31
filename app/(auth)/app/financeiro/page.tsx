import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LicenciadoFinancial } from "@/components/financial/licenciado-financial"

export default async function LicenciadoFinanceiroPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== "LICENCIADO") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas vendas e lucros
        </p>
      </div>

      <LicenciadoFinancial />
    </div>
  )
}
