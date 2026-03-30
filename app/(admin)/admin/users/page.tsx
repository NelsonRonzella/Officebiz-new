import Link from "next/link"
import { Plus } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { UsersTable } from "@/components/admin/users-table"

export default async function AdminUsersPage() {
  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        emailVerified: true,
        telefone: true,
        createdAt: true,
      },
    }),
    db.user.count(),
  ])

  // Serialize dates for client component
  const serializedUsers = users.map((u) => ({
    ...u,
    emailVerified: u.emailVerified?.toISOString() || null,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Novo usuário
          </Button>
        </Link>
      </div>

      <UsersTable initialUsers={serializedUsers} initialTotal={total} />
    </div>
  )
}
