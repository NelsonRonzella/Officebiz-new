"use client"

import { useEffect, useState } from "react"
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/financial"
import {
  RevenueLineChart,
  RevenueCostBarChart,
} from "@/components/charts/chart-wrapper"

interface FinancialSummary {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  orderCount: number
  avgTicket: number
  byProduct: Array<{
    id: string
    name: string
    revenue: number
    cost: number
    profit: number
    count: number
  }>
  byLicenciado: Array<{
    id: string
    name: string
    email: string
    revenue: number
    cost: number
    profit: number
    count: number
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    cost: number
    profit: number
    count: number
  }>
}

interface FinancialDashboardProps {
  initialPeriod: string
}

export function FinancialDashboard({ initialPeriod }: FinancialDashboardProps) {
  const [period, setPeriod] = useState(initialPeriod)
  const [data, setData] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/financial/summary?period=${period}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error("Erro ao carregar dados financeiros:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  const periods = [
    { value: "7d", label: "7 dias" },
    { value: "30d", label: "30 dias" },
    { value: "90d", label: "90 dias" },
    { value: "all", label: "Tudo" },
  ]

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

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === p.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalRevenue)}
              </p>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.totalCost)}
              </p>
              <p className="text-sm text-muted-foreground">Custo Total</p>
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
              <ShoppingCart className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.avgTicket)}
              </p>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line Chart: Receita Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
            ) : (
              <RevenueLineChart data={data.monthlyData} />
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Receita vs Custo */}
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Custo por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
            ) : (
              <RevenueCostBarChart data={data.monthlyData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos (por receita)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Receita
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Qtd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byProduct.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  ) : (
                    data.byProduct.slice(0, 5).map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {formatCurrency(p.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {p.count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Licenciados */}
        <Card>
          <CardHeader>
            <CardTitle>Top Licenciados (por volume)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Licenciado
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Receita
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Qtd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byLicenciado.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhum licenciado encontrado.
                      </td>
                    </tr>
                  ) : (
                    data.byLicenciado.slice(0, 5).map((l) => (
                      <tr key={l.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {l.name}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {formatCurrency(l.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          {l.count}
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
    </div>
  )
}
