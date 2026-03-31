import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { toNumber } from "@/lib/financial"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30d"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Build date filter
    let dateFilter: { gte?: Date; lte?: Date } | undefined

    if (startDateParam || endDateParam) {
      dateFilter = {}
      if (startDateParam) dateFilter.gte = new Date(startDateParam)
      if (endDateParam) dateFilter.lte = new Date(endDateParam)
    } else if (period !== "all") {
      const days = period === "7d" ? 7 : period === "90d" ? 90 : 30
      dateFilter = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: "CONCLUIDO" }
    if (dateFilter) where.createdAt = dateFilter

    // Get all completed orders with product and creator info
    const orders = await db.order.findMany({
      where,
      select: {
        id: true,
        costPrice: true,
        salePrice: true,
        createdAt: true,
        product: { select: { id: true, name: true } },
        criador: { select: { id: true, name: true, email: true } },
      },
    })

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
    const totalCost = orders.reduce((sum, o) => sum + toNumber(o.costPrice), 0)
    const totalProfit = totalRevenue - totalCost
    const orderCount = orders.length
    const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0

    // Breakdown by product
    const productMap = new Map<string, { name: string; revenue: number; cost: number; count: number }>()
    for (const order of orders) {
      const key = order.product.id
      const existing = productMap.get(key) || { name: order.product.name, revenue: 0, cost: 0, count: 0 }
      existing.revenue += toNumber(order.salePrice)
      existing.cost += toNumber(order.costPrice)
      existing.count += 1
      productMap.set(key, existing)
    }
    const byProduct = Array.from(productMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.revenue - data.cost,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Breakdown by licenciado
    const licenciadoMap = new Map<string, { name: string; email: string; revenue: number; cost: number; count: number }>()
    for (const order of orders) {
      const key = order.criador.id
      const existing = licenciadoMap.get(key) || {
        name: order.criador.name || order.criador.email,
        email: order.criador.email,
        revenue: 0,
        cost: 0,
        count: 0,
      }
      existing.revenue += toNumber(order.salePrice)
      existing.cost += toNumber(order.costPrice)
      existing.count += 1
      licenciadoMap.set(key, existing)
    }
    const byLicenciado = Array.from(licenciadoMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        email: data.email,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.revenue - data.cost,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Monthly breakdown (last 6 months)
    const monthlyData: Array<{ month: string; revenue: number; cost: number; profit: number; count: number }> = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt)
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
      })
      const revenue = monthOrders.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
      const cost = monthOrders.reduce((sum, o) => sum + toNumber(o.costPrice), 0)
      monthlyData.push({
        month: monthLabel,
        revenue,
        cost,
        profit: revenue - cost,
        count: monthOrders.length,
      })
    }

    return NextResponse.json({
      totalRevenue,
      totalCost,
      totalProfit,
      orderCount,
      avgTicket,
      byProduct,
      byLicenciado,
      monthlyData,
    })
  } catch (error) {
    console.error("GET /api/financial/summary error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
