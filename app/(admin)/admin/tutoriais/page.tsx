import Link from "next/link"
import { Plus } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { TutorialsTable } from "@/components/admin/tutorials-table"

export default async function AdminTutoriaisPage() {
  const [tutorials, total] = await Promise.all([
    db.tutorial.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    }),
    db.tutorial.count(),
  ])

  const serializedTutorials = tutorials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    products: t.products.map((tp) => tp.product),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tutoriais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os tutoriais em vídeo da plataforma
          </p>
        </div>
        <Link href="/admin/tutoriais/novo">
          <Button>
            <Plus className="mr-2 size-4" />
            Novo tutorial
          </Button>
        </Link>
      </div>

      <TutorialsTable initialTutorials={serializedTutorials} initialTotal={total} />
    </div>
  )
}
