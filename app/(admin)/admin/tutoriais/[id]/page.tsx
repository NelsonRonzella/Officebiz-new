import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { TutorialForm } from "@/components/admin/tutorial-form"

export default async function EditarTutorialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [tutorial, products] = await Promise.all([
    db.tutorial.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
    db.product.findMany({
      where: { active: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!tutorial) {
    notFound()
  }

  const serializedTutorial = {
    id: tutorial.id,
    title: tutorial.title,
    description: tutorial.description,
    link: tutorial.link,
    products: tutorial.products.map((tp) => ({
      id: tp.product.id,
      name: tp.product.name,
    })),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Editar Tutorial
        </h1>
        <p className="text-sm text-muted-foreground">
          Atualize as informações do tutorial
        </p>
      </div>

      <TutorialForm tutorial={serializedTutorial} products={products} />
    </div>
  )
}
