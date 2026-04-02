import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { canAccessConsultas, getDashboardPath } from "@/lib/permissions"
import { ConsultaDominio } from "@/components/consultas/consulta-dominio"

export default async function ConsultaDominioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) redirect("/login")
  if (!canAccessConsultas(user.role)) redirect(getDashboardPath(user.role))

  return (
    <div className="space-y-6 max-w-3xl">
      <ConsultaDominio />
    </div>
  )
}
