import { FinancialDashboard } from "@/components/admin/financial-dashboard"

export default function AdminFinanceiroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das finanças da plataforma
        </p>
      </div>

      <FinancialDashboard initialPeriod="30d" />
    </div>
  )
}
