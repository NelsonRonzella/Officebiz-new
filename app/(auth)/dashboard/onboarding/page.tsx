import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      telefone: true,
      companyName: true,
      companyLogo: true,
      onboardingCompleted: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Already completed onboarding — go to dashboard
  if (user.onboardingCompleted) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <OnboardingWizard
        initialData={{
          name: user.name,
          phone: user.telefone,
          companyName: user.companyName,
          companyLogo: user.companyLogo,
        }}
      />
    </div>
  )
}
