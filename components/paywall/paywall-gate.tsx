"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { hasAccess as checkAccess } from "@/lib/subscription"

interface PaywallGateProps {
  user: {
    plan: string
    trialEndsAt: Date | null
    stripeCurrentPeriodEnd: Date | null
  }
  children: React.ReactNode
}

export function PaywallGate({ user, children }: PaywallGateProps) {
  if (checkAccess(user as Parameters<typeof checkAccess>[0])) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <ShieldAlert className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Seu plano atual não permite acesso a esta funcionalidade. Faça
            upgrade para o plano Pro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            render={<Link href="/settings/billing" />}
            className="w-full"
          >
            Fazer upgrade para Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
