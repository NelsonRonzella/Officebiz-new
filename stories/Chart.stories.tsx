"use client"

import type { Meta, StoryObj } from "@storybook/react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
} from "recharts"

const meta: Meta = {
  title: "UI/Chart",
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

const barData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const barConfig: ChartConfig = {
  desktop: { label: "Desktop", color: "var(--color-primary)" },
  mobile: { label: "Mobile", color: "var(--color-secondary)" },
}

export const BarChartStory: Story = {
  name: "Bar Chart",
  render: () => (
    <ChartContainer config={barConfig} className="h-64 w-full max-w-lg">
      <BarChart data={barData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
}

export const LineChartStory: Story = {
  name: "Line Chart",
  render: () => (
    <ChartContainer config={barConfig} className="h-64 w-full max-w-lg">
      <LineChart data={barData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        <Line dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
}

export const AreaChartStory: Story = {
  name: "Area Chart",
  render: () => (
    <ChartContainer config={barConfig} className="h-64 w-full max-w-lg">
      <AreaChart data={barData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="desktop" fill="var(--color-desktop)" stroke="var(--color-desktop)" fillOpacity={0.2} />
        <Area dataKey="mobile" fill="var(--color-mobile)" stroke="var(--color-mobile)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  ),
}

const pieData = [
  { name: "Chrome", value: 275, fill: "var(--color-chrome)" },
  { name: "Safari", value: 200, fill: "var(--color-safari)" },
  { name: "Firefox", value: 187, fill: "var(--color-firefox)" },
  { name: "Edge", value: 173, fill: "var(--color-edge)" },
]

const pieConfig: ChartConfig = {
  chrome: { label: "Chrome", color: "var(--color-primary)" },
  safari: { label: "Safari", color: "var(--color-secondary)" },
  firefox: { label: "Firefox", color: "var(--color-destructive)" },
  edge: { label: "Edge", color: "var(--color-accent)" },
}

export const PieChartStory: Story = {
  name: "Pie Chart",
  render: () => (
    <ChartContainer config={pieConfig} className="h-64 w-full max-w-xs">
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  ),
}
