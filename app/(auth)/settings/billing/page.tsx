import { requireAuth } from "@/lib/require-auth"
import { PageHeader } from "@/components/dashboard/page-header"
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
  const { user } = await requireAuth({
    plan: true,
    trialEndsAt: true,
    stripeCurrentPeriodEnd: true,
    stripeCustomerId: true,
  })

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
      <PageHeader
        title="Assinatura"
        description="Gerencie seu plano e pagamentos."
      />

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
