"use client"

import { useEffect, useState } from "react"
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Loader2,
  Percent,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getStatusLabel, formatDate } from "@/lib/financial"
import { SalesLineChart } from "@/components/charts/chart-wrapper"

interface MonthlyData {
  month: string
  revenue: number
  cost: number
  profit: number
  count: number
}

interface RecentOrder {
  id: string
  costPrice: number
  salePrice: number
  profit: number
  marginPercent: number
  status: string
  createdAt: string
  user: { name: string | null; email: string }
  product: { name: string }
}

interface LicenciadoData {
  totalSales: number
  totalCost: number
  totalProfit: number
  orderCount: number
  monthlyBreakdown: MonthlyData[]
  recentOrders: RecentOrder[]
}

export function LicenciadoFinancial() {
  const [data, setData] = useState<LicenciadoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/financial/licenciado")
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error("Erro ao carregar dados financeiros:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Erro ao carregar dados financeiros.
      </div>
    )
  }

  const avgTicket = data.orderCount > 0 ? data.totalSales / data.orderCount : 0
  const avgMargin =
    data.totalSales > 0
      ? ((data.totalProfit / data.totalSales) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalSales)}
              </p>
              <p className="text-sm text-muted-foreground">Total Vendas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalProfit)}
              </p>
              <p className="text-sm text-muted-foreground">Lucro Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Receipt className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(avgTicket)}
              </p>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Percent className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {avgMargin}%
              </p>
              <p className="text-sm text-muted-foreground">Margem Média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart: Vendas Mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.monthlyBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
          ) : (
            <SalesLineChart data={data.monthlyBreakdown} />
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Venda
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Lucro
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {order.user.name || order.user.email}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-foreground sm:table-cell">
                        {order.product.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {formatCurrency(order.salePrice)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-medium ${
                          order.profit >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {formatCurrency(order.profit)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm md:table-cell">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {formatDate(new Date(order.createdAt))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
