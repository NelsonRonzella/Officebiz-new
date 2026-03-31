import type { Decimal } from "@prisma/client/runtime/client"

interface OrderForCalc {
  costPrice: Decimal | null
  salePrice: Decimal | null
  status: string
  createdAt: Date
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function calculateMargin(
  costPrice: number,
  salePrice: number
): { profit: number; marginPercent: number } {
  const profit = salePrice - costPrice
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0
  return { profit, marginPercent }
}

export function toNumber(value: Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0
  return Number(value)
}

export function getFinancialSummary(orders: OrderForCalc[]): {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  orderCount: number
  avgTicket: number
} {
  const completed = orders.filter((o) => o.status === "CONCLUIDO")
  const totalRevenue = completed.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
  const totalCost = completed.reduce((sum, o) => sum + toNumber(o.costPrice), 0)
  const totalProfit = totalRevenue - totalCost
  const orderCount = completed.length
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0

  return { totalRevenue, totalCost, totalProfit, orderCount, avgTicket }
}

export function getMonthlyBreakdown(
  orders: OrderForCalc[],
  months: number
): Array<{
  month: string
  revenue: number
  cost: number
  profit: number
  count: number
}> {
  const now = new Date()
  const result: Array<{
    month: string
    revenue: number
    cost: number
    profit: number
    count: number
  }> = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    })

    const monthOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return (
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear() &&
        o.status === "CONCLUIDO"
      )
    })

    const revenue = monthOrders.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
    const cost = monthOrders.reduce((sum, o) => sum + toNumber(o.costPrice), 0)

    result.push({
      month: monthKey,
      revenue,
      cost,
      profit: revenue - cost,
      count: monthOrders.length,
    })
  }

  return result
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR")
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
    EM_ANDAMENTO: "Em Andamento",
    CANCELADO: "Cancelado",
    RETORNO: "Retorno",
    PAGO: "Pago",
    CONCLUIDO: "Concluído",
  }
  return labels[status] || status
}
