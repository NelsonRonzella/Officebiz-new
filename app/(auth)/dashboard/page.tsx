import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PlanCard } from "@/components/dashboard/plan-card"
import { TrialBanner } from "@/components/dashboard/trial-banner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      onboardingCompleted: true,
      companyName: true,
      phone: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const checklist = [
    {
      label: "Completar cadastro",
      done: user.onboardingCompleted,
    },
    {
      label: "Adicionar dados da empresa",
      done: !!user.companyName,
    },
    {
      label: "Adicionar WhatsApp",
      done: !!user.phone,
    },
    {
      label: "Escolher um plano",
      done: user.plan === "PRO",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bem-vindo{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua conta.
        </p>
      </div>

      {/* Trial banner */}
      {user.plan === "TRIAL" && (
        <TrialBanner trialEndsAt={user.trialEndsAt} />
      )}

      {/* Plan card */}
      <PlanCard
        plan={user.plan}
        trialEndsAt={user.trialEndsAt}
        stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
      />

      {/* Next steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                {item.done ? (
                  <CheckCircle2 className="size-5 text-accent" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
                <span
                  className={
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
