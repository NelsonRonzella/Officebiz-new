import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { daysLeftInTrial } from "@/lib/subscription"

interface TrialBannerProps {
  trialEndsAt: Date | null
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const daysLeft = daysLeftInTrial({ trialEndsAt })

  if (daysLeft <= 0) return null

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[hsl(var(--warning))] px-4 py-3 text-sm text-[hsl(var(--warning-foreground))]">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <p>
          Você tem <strong>{daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}</strong> no seu período de teste.
        </p>
      </div>
      <Link
        href="/settings/billing"
        className="shrink-0 font-semibold underline underline-offset-2 hover:opacity-80"
      >
        Fazer upgrade &rarr;
      </Link>
    </div>
  )
}
