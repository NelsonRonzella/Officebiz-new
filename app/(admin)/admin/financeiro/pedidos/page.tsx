import { FinancialOrdersTable } from "@/components/admin/financial-orders-table"

export default function AdminFinanceiroPedidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Pedidos — Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Análise financeira detalhada dos pedidos
        </p>
      </div>

      <FinancialOrdersTable />
    </div>
  )
}
