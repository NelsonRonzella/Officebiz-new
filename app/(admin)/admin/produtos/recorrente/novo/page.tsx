import { db } from "@/lib/db"
import { ProductFormRecorrente } from "@/components/admin/product-form-recorrente"

export default async function NovoProdutoRecorrentePage() {
  const tutorials = await db.tutorial.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Novo Produto Recorrente
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie um novo produto recorrente com categorias de documentos
        </p>
      </div>

      <ProductFormRecorrente tutorials={tutorials} />
    </div>
  )
}
