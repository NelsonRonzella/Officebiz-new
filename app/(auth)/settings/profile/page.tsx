import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      companyName: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Perfil
        </h1>
        <p className="text-muted-foreground">
          Atualize suas informações pessoais.
        </p>
      </div>

      <ProfileForm
        initialData={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          companyName: user.companyName ?? "",
        }}
      />
    </div>
  )
}
