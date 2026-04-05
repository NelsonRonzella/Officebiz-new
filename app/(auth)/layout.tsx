import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth, signOut } from "@/lib/auth"
import { db } from "@/lib/db"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomBar } from "@/components/layout/bottom-bar"

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
    select: {
      onboardingCompleted: true,
      role: true,
      active: true,
      companyLogo: true,
      companyName: true,
      brandPrimaryColor: true,
      brandAccentColor: true,
      createdBy: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Redirect inactive users
  if (!user.active) {
    await signOut({ redirectTo: "/login" })
  }

  // Redirect admins to admin area
  if (user.role === "ADMIN") {
    redirect("/admin")
  }

  // Get current path from headers
  const headerList = await headers()
  const pathname = headerList.get("x-next-pathname") ?? ""

  if (
    !user.onboardingCompleted &&
    !pathname.startsWith("/dashboard/onboarding")
  ) {
    redirect("/dashboard/onboarding")
  }

  // Resolve branding: for licenciado use their own, for clients use their licenciado's
  let branding = {
    logo: user.companyLogo,
    name: user.companyName,
    primaryColor: user.brandPrimaryColor,
    accentColor: user.brandAccentColor,
  }

  if (user.role !== "LICENCIADO" && user.createdBy) {
    const creator = await db.user.findUnique({
      where: { id: user.createdBy },
      select: {
        role: true,
        companyLogo: true,
        companyName: true,
        brandPrimaryColor: true,
        brandAccentColor: true,
      },
    })
    if (creator?.role === "LICENCIADO") {
      branding = {
        logo: creator.companyLogo,
        name: creator.companyName,
        primaryColor: creator.brandPrimaryColor,
        accentColor: creator.brandAccentColor,
      }
    }
  }

  // Build CSS custom properties for branding colors
  const brandStyles: Record<string, string> = {}
  if (branding.primaryColor) {
    brandStyles["--brand-primary"] = branding.primaryColor
  }
  if (branding.accentColor) {
    brandStyles["--brand-accent"] = branding.accentColor
  }

  return (
    <div className="min-h-screen bg-background" style={brandStyles as React.CSSProperties}>
      <Sidebar
        role={user.role}
        brandLogo={branding.logo ?? undefined}
        brandName={branding.name ?? undefined}
      />
      <BottomBar role={user.role} />
      <main className="md:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-8 pb-20 sm:px-6 md:pb-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
