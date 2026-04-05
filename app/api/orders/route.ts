import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canCreateOrders } from "@/lib/permissions"
import { hasAccess } from "@/lib/subscription"
import { createOrderSteps, createOrderCategories } from "@/lib/order-service"
import { createBulkNotifications } from "@/lib/notifications"
import { sendOrderCreatedEmail } from "@/lib/email"
import { createOrderSchema } from "@/lib/validations"
import { createOrderCheckoutSession } from "@/lib/stripe"

function canViewOrder(
  order: { userId: string; criadoPor: string; prestadorId: string | null; status: string },
  user: { id: string; role: string }
): boolean {
  if (user.role === "ADMIN") return true
  if (user.role === "LICENCIADO") return order.criadoPor === user.id
  if (user.role === "PRESTADOR")
    return order.prestadorId === user.id || (order.prestadorId === null && order.status === "PAGO")
  if (user.role === "CLIENTE") return order.userId === user.id
  return false
}

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

    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const productType = searchParams.get("productType") || ""
    const dateStart = searchParams.get("dateStart") || ""
    const dateEnd = searchParams.get("dateEnd") || ""
    const criadoPor = searchParams.get("criadoPor") || ""
    const prestadorId = searchParams.get("prestadorId") || ""
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}

    // Role-based filtering
    if (currentUser.role === "LICENCIADO") {
      where.criadoPor = currentUser.id
    } else if (currentUser.role === "PRESTADOR") {
      where.OR = [
        { prestadorId: currentUser.id },
        { prestadorId: null, status: "PAGO" },
      ]
    } else if (currentUser.role === "CLIENTE") {
      where.userId = currentUser.id
    }
    // ADMIN: no base filter

    // Admin-only extra filters
    if (currentUser.role === "ADMIN") {
      if (criadoPor) {
        where.criadoPor = criadoPor
      }
      if (prestadorId) {
        where.prestadorId = prestadorId
      }
    }

    // Common filters
    if (status) {
      where.status = status
    }

    if (productType) {
      where.product = { type: productType }
    }

    if (dateStart || dateEnd) {
      where.createdAt = {}
      if (dateStart) {
        where.createdAt.gte = new Date(dateStart)
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd)
      }
    }

    if (search) {
      const searchFilter = [
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
      ]

      if (where.OR) {
        // PRESTADOR already has OR, wrap with AND
        where.AND = [
          { OR: where.OR },
          { OR: searchFilter },
        ]
        delete where.OR
      } else {
        where.OR = searchFilter
      }
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          product: { select: { name: true, type: true } },
          user: { select: { name: true, email: true } },
          criador: { select: { name: true } },
          prestador: { select: { name: true } },
          currentStep: true,
          _count: { select: { steps: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        plan: true,
        trialEndsAt: true,
        stripeCurrentPeriodEnd: true,
      },
    })

    if (!currentUser || !canCreateOrders(currentUser.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Plan gating for LICENCIADO users
    if (currentUser.role === "LICENCIADO" && !hasAccess(currentUser)) {
      return NextResponse.json(
        { error: "Plano expirado. Faça upgrade para continuar." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { userId, productId, message, file } = parsed.data

    // Validate user exists and is a client
    const client = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Validate product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, type: true, active: true, name: true, price: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    if (!product.active) {
      return NextResponse.json({ error: "Produto inativo" }, { status: 400 })
    }

    // Create order with product price
    const priceValue = Number(product.price)
    const order = await db.order.create({
      data: {
        userId,
        productId,
        status: "AGUARDANDO_PAGAMENTO",
        criadoPor: currentUser.id,
        salePrice: priceValue,
      },
    })

    // Generate Stripe Checkout Session
    let checkoutUrl: string | null = null
    try {
      const checkoutSession = await createOrderCheckoutSession({
        orderId: order.id,
        productName: product.name,
        priceInCents: Math.round(priceValue * 100),
        customerEmail: client.email,
      })

      await db.order.update({
        where: { id: order.id },
        data: { stripeCheckoutSessionId: checkoutSession.id },
      })

      checkoutUrl = checkoutSession.url
    } catch (err) {
      console.error("Stripe checkout creation failed:", err)
      // Order is created but without payment link — admin can handle manually
    }

    // Create steps or categories based on product type
    if (product.type === "PONTUAL") {
      await createOrderSteps(order.id, productId)
    } else if (product.type === "RECORRENTE") {
      await createOrderCategories(order.id, productId)
    }

    // Create initial message if provided
    if (message) {
      await db.orderMessage.create({
        data: {
          orderId: order.id,
          userId: currentUser.id,
          message,
          file: file || null,
        },
      })
    }

    // Notify admin users about new order
    db.user
      .findMany({ where: { role: "ADMIN" }, select: { id: true } })
      .then((admins) => {
        const adminIds = admins.map((a) => a.id)
        if (adminIds.length > 0) {
          createBulkNotifications(
            adminIds,
            "Novo pedido criado",
            `Um novo pedido foi criado e está aguardando pagamento.`,
            "ORDER_UPDATE",
            `/app/pedidos/${order.id}`
          )
        }
      })
      .catch(console.error)

    // Send email to client about new order
    sendOrderCreatedEmail(client.email, {
      clientName: client.name || "Cliente",
      productName: product.name,
      orderId: order.id,
    }).catch(console.error)

    // Return created order with includes + checkout URL
    const createdOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        product: { select: { name: true, type: true } },
        user: { select: { name: true, email: true } },
        criador: { select: { name: true } },
        steps: { orderBy: { order: "asc" } },
        documentCategories: { orderBy: { order: "asc" } },
        messages: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    return NextResponse.json({ ...createdOrder, checkoutUrl }, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
