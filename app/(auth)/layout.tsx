import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Sidebar } from "@/components/layout/sidebar"

export default async function AuthLayout({
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
    select: { onboardingCompleted: true },
  })

  // Get current path from headers
  const headerList = await headers()
  const pathname = headerList.get("x-next-pathname") ?? ""

  if (
    user &&
    !user.onboardingCompleted &&
    !pathname.startsWith("/dashboard/onboarding")
  ) {
    redirect("/dashboard/onboarding")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
