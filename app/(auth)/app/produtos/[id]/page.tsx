import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canViewProducts, canViewProductPrice, getDashboardPath } from "@/lib/permissions"
import { ProductView } from "@/components/products/product-view"

interface ProdutoPageProps {
  params: Promise<{ id: string }>
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { id } = await params

  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) {
    redirect("/login")
  }

  if (!canViewProducts(user.role)) {
    redirect(getDashboardPath(user.role))
  }

  const product = await db.product.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
      documentCategories: {
        orderBy: { order: "asc" },
      },
      tutorials: {
        include: {
          tutorial: true,
        },
      },
    },
  })

  if (!product || (!product.active && user.role !== "ADMIN")) {
    redirect("/app/produtos")
  }

  const serializedProduct = {
    ...product,
    price: product.price.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    steps: product.steps.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    documentCategories: product.documentCategories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    tutorials: product.tutorials.map((tp) => ({
      ...tp,
      tutorial: {
        ...tp.tutorial,
        createdAt: tp.tutorial.createdAt.toISOString(),
        updatedAt: tp.tutorial.updatedAt.toISOString(),
      },
    })),
  }

  const showPrice = canViewProductPrice(user.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {product.name}
        </h1>
        <p className="text-muted-foreground">Detalhes do produto</p>
      </div>

      <ProductView product={serializedProduct} showPrice={showPrice} />
    </div>
  )
}
