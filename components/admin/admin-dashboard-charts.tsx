"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  OrdersByMonthBarChart,
  OrdersByStatusPieChart,
} from "@/components/charts/chart-wrapper"

interface AdminDashboardChartsProps {
  ordersByMonth: Array<{ month: string; count: number }>
  ordersByStatus: Array<{ status: string; label: string; count: number }>
}

export function AdminDashboardCharts({
  ordersByMonth,
  ordersByStatus,
}: AdminDashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar Chart: Pedidos por mês */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por Mês (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum dado disponível.
            </p>
          ) : (
            <OrdersByMonthBarChart data={ordersByMonth} />
          )}
        </CardContent>
      </Card>

      {/* Pie/Donut Chart: Pedidos por status */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum dado disponível.
            </p>
          ) : (
            <OrdersByStatusPieChart data={ordersByStatus} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
