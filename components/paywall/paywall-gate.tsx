import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PaywallGateProps {
  hasAccess: boolean
  children: React.ReactNode
}

export function PaywallGate({ hasAccess, children }: PaywallGateProps) {
  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Seu período de teste expirou</CardTitle>
          <CardDescription>
            Faça upgrade para continuar utilizando todos os recursos do OfficeBiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/settings/billing" />} className="w-full">
            Fazer upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
