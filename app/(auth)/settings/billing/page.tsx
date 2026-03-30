import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BillingActions } from "./billing-actions"

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const planLabels = {
    FREE: "Gratuito",
    TRIAL: "Teste",
    PRO: "Pro",
  } as const

  function formatDate(date: Date | null): string {
    if (!date) return "—"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const expirationDate =
    user.plan === "TRIAL" ? user.trialEndsAt : user.stripeCurrentPeriodEnd

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Assinatura
        </h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e pagamentos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Status do plano</CardTitle>
            <Badge>{planLabels[user.plan]}</Badge>
          </div>
          <CardDescription>
            {user.plan === "PRO" && user.stripeCurrentPeriodEnd
              ? `Renova em ${formatDate(user.stripeCurrentPeriodEnd)}`
              : user.plan === "TRIAL"
                ? `Expira em ${formatDate(user.trialEndsAt)}`
                : "Sem plano ativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingActions
            plan={user.plan}
            hasStripeCustomer={!!user.stripeCustomerId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
