import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { OrderDetail } from "@/components/orders/order-detail"

interface PedidoDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PedidoDetailPage({ params }: PedidoDetailPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  })

  if (!currentUser) {
    redirect("/login")
  }

  const { id } = await params

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      criador: {
        select: { id: true, name: true },
      },
      prestador: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, name: true, type: true, price: true },
      },
      steps: {
        orderBy: { order: "asc" },
      },
      documentCategories: {
        orderBy: { order: "asc" },
        include: {
          attachments: {
            include: {
              user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      messages: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!order) {
    notFound()
  }

  // Access control: admin sees all, licenciado sees own orders, prestador sees assigned, cliente sees own
  const role = currentUser.role
  const userId = currentUser.id

  if (role === "LICENCIADO" && order.criadoPor !== userId) {
    notFound()
  }

  if (role === "PRESTADOR" && order.prestadorId !== userId) {
    notFound()
  }

  if (role === "CLIENTE" && order.userId !== userId) {
    notFound()
  }

  // Serialize for client component
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    product: {
      ...order.product,
      price: order.product.price.toString(),
    },
    steps: order.steps.map((s) => ({
      ...s,
      startedAt: s.startedAt?.toISOString() ?? null,
      finishedAt: s.finishedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    documentCategories: order.documentCategories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      attachments: cat.attachments.map((att) => ({
        ...att,
        createdAt: att.createdAt.toISOString(),
      })),
    })),
    messages: order.messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    })),
  }

  return (
    <OrderDetail
      order={serializedOrder}
      currentUserRole={currentUser.role}
      currentUserId={currentUser.id}
    />
  )
}
