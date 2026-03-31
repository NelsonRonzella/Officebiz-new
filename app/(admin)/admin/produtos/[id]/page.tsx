import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductFormPontual } from "@/components/admin/product-form-pontual"
import { ProductFormRecorrente } from "@/components/admin/product-form-recorrente"

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, tutorials] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: "asc" } },
        documentCategories: { orderBy: { order: "asc" } },
        tutorials: {
          include: {
            tutorial: {
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
    db.tutorial.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  if (!product) {
    notFound()
  }

  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    type: product.type,
    steps: product.steps.map((s) => ({
      title: s.title,
      description: s.description,
      durationDays: s.durationDays,
      order: s.order,
    })),
    documentCategories: product.documentCategories.map((c) => ({
      title: c.title,
      description: c.description,
      order: c.order,
    })),
    tutorials: product.tutorials.map((tp) => ({
      id: tp.tutorial.id,
      title: tp.tutorial.title,
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Editar Produto
        </h1>
        <p className="text-sm text-muted-foreground">
          Atualize as informações do produto
        </p>
      </div>

      {product.type === "PONTUAL" ? (
        <ProductFormPontual product={serializedProduct} tutorials={tutorials} />
      ) : (
        <ProductFormRecorrente product={serializedProduct} tutorials={tutorials} />
      )}
    </div>
  )
}
