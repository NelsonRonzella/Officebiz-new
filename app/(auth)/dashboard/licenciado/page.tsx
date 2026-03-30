import { redirect } from "next/navigation"
import Link from "next/link"
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
import { CheckCircle2, Circle, Users } from "lucide-react"

export default async function LicenciadoDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      telefone: true,
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "LICENCIADO") {
    redirect("/dashboard")
  }

  const clientCount = await db.user.count({
    where: {
      createdBy: session.user.id,
      role: "CLIENTE",
    },
  })

  const hasClients = clientCount > 0
  const hasProfile = !!user.name && !!user.telefone

  const checklist = [
    {
      label: "Complete seu perfil",
      done: hasProfile,
    },
    {
      label: "Cadastre seu primeiro cliente",
      done: hasClients,
    },
    {
      label: "Explore os serviços disponíveis",
      done: false,
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

      {/* Clients card */}
      <Link href="/app/clientes" className="block">
        <Card className="transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <CardTitle>Seus Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{clientCount}</p>
            <p className="text-sm text-muted-foreground">
              {clientCount === 1
                ? "cliente cadastrado"
                : "clientes cadastrados"}
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Next steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
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
