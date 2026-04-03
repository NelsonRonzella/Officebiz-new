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
    <div className="flex flex-col gap-2 rounded-lg bg-warning px-4 py-3 text-sm text-warning-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <p>
          Você tem <strong>{daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}</strong> no seu período de teste.
        </p>
      </div>
      <Link
        href="/settings/billing"
        className="shrink-0 font-semibold underline underline-offset-2 hover:opacity-80 pl-6 sm:pl-0"
      >
        Fazer upgrade &rarr;
      </Link>
    </div>
  )
}
