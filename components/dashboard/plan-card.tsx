import Link from "next/link"
import type { Plan } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PlanCardProps {
  plan: Plan
  trialEndsAt: Date | null
  stripeCurrentPeriodEnd: Date | null
}

const planLabels: Record<Plan, string> = {
  FREE: "Gratuito",
  TRIAL: "Teste",
  PRO: "Pro",
}

const badgeVariant: Record<Plan, "default" | "secondary" | "outline"> = {
  FREE: "secondary",
  TRIAL: "outline",
  PRO: "default",
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function PlanCard({ plan, trialEndsAt, stripeCurrentPeriodEnd }: PlanCardProps) {
  const expirationDate = plan === "TRIAL" ? trialEndsAt : stripeCurrentPeriodEnd

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Seu plano</CardTitle>
          <Badge variant={badgeVariant[plan]}>{planLabels[plan]}</Badge>
        </div>
        <CardDescription>
          {plan === "PRO" && !stripeCurrentPeriodEnd
            ? "Acesso ilimitado"
            : plan === "FREE"
              ? "Sem acesso ativo"
              : `Expira em ${formatDate(expirationDate)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(plan === "TRIAL" || plan === "FREE") && (
          <Button render={<Link href="/settings/billing" />}>
            Fazer upgrade
          </Button>
        )}
        {plan === "PRO" && (
          <Button variant="outline" render={<Link href="/settings/billing" />}>
            Gerenciar assinatura
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
