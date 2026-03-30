import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { db } from "@/lib/db"
import { canAccessAdmin } from "@/lib/permissions"
import { Sidebar } from "@/components/layout/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, active: true },
  })

  if (!user || !canAccessAdmin(user.role)) {
    redirect("/dashboard")
  }

  if (!user.active) {
    await signOut({ redirectTo: "/login" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="ADMIN" />
      <main className="md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
