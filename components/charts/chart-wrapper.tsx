"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { PieLabelRenderProps, PieLabel } from "recharts"
import { formatCurrency } from "@/lib/financial"

/* ── Paleta de cores para gráficos (SVG fills, não classes Tailwind) ── */
const CHART_COLORS = {
  primary: "#1E3A5F",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
}

const STATUS_COLORS: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: CHART_COLORS.warning,
  EM_ANDAMENTO: CHART_COLORS.blue,
  PAGO: CHART_COLORS.success,
  CONCLUIDO: CHART_COLORS.primary,
  CANCELADO: CHART_COLORS.danger,
  RETORNO: CHART_COLORS.purple,
}

/* ── Tooltip customizado ── */
function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

function CountTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

/* ── Bar Chart: Pedidos por mês ── */
interface OrdersByMonthBarChartProps {
  data: Array<{ month: string; count: number }>
}

export function OrdersByMonthBarChart({ data }: OrdersByMonthBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip content={<CountTooltip />} />
        <Bar
          dataKey="count"
          name="Pedidos"
          fill={CHART_COLORS.primary}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Pie/Donut Chart: Pedidos por status ── */
interface OrdersByStatusPieChartProps {
  data: Array<{ status: string; label: string; count: number }>
}

export function OrdersByStatusPieChart({ data }: OrdersByStatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={((props: PieLabelRenderProps) => `${props.name ?? ""}: ${props.value ?? 0}`) as PieLabel}
          labelLine
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] || CHART_COLORS.blue}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [String(value), String(name)]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ── Line Chart: Receita mensal ── */
interface RevenueLineChartProps {
  data: Array<{ month: string; revenue: number }>
}

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          width={90}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Receita"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.primary }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ── Bar Chart: Receita vs Custo por mês ── */
interface RevenueCostBarChartProps {
  data: Array<{ month: string; revenue: number; cost: number; profit: number }>
}

export function RevenueCostBarChart({ data }: RevenueCostBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          width={90}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Legend />
        <Bar
          dataKey="revenue"
          name="Receita"
          fill={CHART_COLORS.primary}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="cost"
          name="Custo"
          fill={CHART_COLORS.danger}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Line Chart: Vendas mensais (para licenciado) ── */
interface SalesLineChartProps {
  data: Array<{ month: string; revenue: number; profit: number; count: number }>
}

export function SalesLineChart({ data }: SalesLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          width={90}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Receita"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.primary }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Lucro"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.success }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
