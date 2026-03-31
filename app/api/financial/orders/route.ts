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

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "LICENCIADO")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const productId = searchParams.get("productId") || ""
    const dateStart = searchParams.get("dateStart") || ""
    const dateEnd = searchParams.get("dateEnd") || ""
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}

    // LICENCIADO sees only own orders
    if (currentUser.role === "LICENCIADO") {
      where.criadoPor = currentUser.id
    }

    if (status) where.status = status
    if (productId) where.productId = productId

    if (dateStart || dateEnd) {
      where.createdAt = {}
      if (dateStart) where.createdAt.gte = new Date(dateStart)
      if (dateEnd) where.createdAt.lte = new Date(dateEnd)
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
        { product: { name: { contains: search, mode: "insensitive" as const } } },
      ]
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          costPrice: true,
          salePrice: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          product: { select: { name: true } },
          criador: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    const ordersWithProfit = orders.map((order) => {
      const cost = toNumber(order.costPrice)
      const sale = toNumber(order.salePrice)
      const profit = sale - cost
      const marginPercent = sale > 0 ? (profit / sale) * 100 : 0
      return {
        ...order,
        costPrice: cost,
        salePrice: sale,
        profit,
        marginPercent,
      }
    })

    return NextResponse.json({
      orders: ordersWithProfit,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("GET /api/financial/orders error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
