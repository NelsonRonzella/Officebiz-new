import { db } from "@/lib/db"
import { TutorialForm } from "@/components/admin/tutorial-form"

export default async function NovoTutorialPage() {
  const products = await db.product.findMany({
    where: { active: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Novo Tutorial
        </h1>
        <p className="text-sm text-muted-foreground">
          Adicione um novo tutorial em vídeo
        </p>
      </div>

      <TutorialForm products={products} />
    </div>
  )
}
