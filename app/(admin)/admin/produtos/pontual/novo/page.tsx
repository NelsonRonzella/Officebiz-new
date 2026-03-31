import { db } from "@/lib/db"
import { ProductFormPontual } from "@/components/admin/product-form-pontual"

export default async function NovoProdutoPontualPage() {
  const tutorials = await db.tutorial.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Novo Produto Pontual
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie um novo produto de serviço pontual com etapas
        </p>
      </div>

      <ProductFormPontual tutorials={tutorials} />
    </div>
  )
}
