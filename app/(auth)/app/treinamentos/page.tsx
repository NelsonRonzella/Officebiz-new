import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { TrainingList } from "@/components/training/training-list"

export default async function TreinamentosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== "LICENCIADO") {
    redirect("/dashboard")
  }

  const tutorials = await db.tutorial.findMany({
    where: { category: "TREINAMENTO" },
    orderBy: { createdAt: "desc" },
  })

  const serialized = tutorials.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    link: t.link,
    createdAt: t.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Treinamentos</h1>
        <p className="text-sm text-muted-foreground">
          Vídeos de treinamento para ajudar você a usar a plataforma
        </p>
      </div>

      <TrainingList tutorials={serialized} />
    </div>
  )
}
