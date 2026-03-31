import Link from "next/link"
import { Plus } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/admin/products-table"

export default async function AdminProdutosPage() {
  const [products, total] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: {
          select: {
            steps: true,
            documentCategories: true,
          },
        },
      },
    }),
    db.product.count(),
  ])

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os produtos e serviços da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/produtos/pontual/novo">
            <Button variant="outline">
              <Plus className="mr-2 size-4" />
              Novo Pontual
            </Button>
          </Link>
          <Link href="/admin/produtos/recorrente/novo">
            <Button>
              <Plus className="mr-2 size-4" />
              Novo Recorrente
            </Button>
          </Link>
        </div>
      </div>

      <ProductsTable initialProducts={serializedProducts} initialTotal={total} />
    </div>
  )
}
