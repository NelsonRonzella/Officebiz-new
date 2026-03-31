import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { toNumber } from "@/lib/financial"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    if (!currentUser || currentUser.role !== "LICENCIADO") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Get all completed orders by this licenciado
    const orders = await db.order.findMany({
      where: {
        criadoPor: currentUser.id,
        status: "CONCLUIDO",
      },
      select: {
        id: true,
        costPrice: true,
        salePrice: true,
        createdAt: true,
        status: true,
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const totalSales = orders.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
    const totalCost = orders.reduce((sum, o) => sum + toNumber(o.costPrice), 0)
    const totalProfit = totalSales - totalCost
    const orderCount = orders.length

    // Monthly breakdown (last 6 months)
    const now = new Date()
    const monthlyBreakdown: Array<{
      month: string
      revenue: number
      cost: number
      profit: number
      count: number
    }> = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt)
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
      })
      const revenue = monthOrders.reduce((sum, o) => sum + toNumber(o.salePrice), 0)
      const cost = monthOrders.reduce((sum, o) => sum + toNumber(o.costPrice), 0)
      monthlyBreakdown.push({
        month: monthLabel,
        revenue,
        cost,
        profit: revenue - cost,
        count: monthOrders.length,
      })
    }

    // Recent orders (last 10 with financial info)
    const recentOrders = await db.order.findMany({
      where: { criadoPor: currentUser.id },
      select: {
        id: true,
        costPrice: true,
        salePrice: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const recentWithProfit = recentOrders.map((order) => {
      const cost = toNumber(order.costPrice)
      const sale = toNumber(order.salePrice)
      const profit = sale - cost
      const marginPercent = sale > 0 ? (profit / sale) * 100 : 0
      return { ...order, costPrice: cost, salePrice: sale, profit, marginPercent }
    })

    return NextResponse.json({
      totalSales,
      totalCost,
      totalProfit,
      orderCount,
      monthlyBreakdown,
      recentOrders: recentWithProfit,
    })
  } catch (error) {
    console.error("GET /api/financial/licenciado error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
