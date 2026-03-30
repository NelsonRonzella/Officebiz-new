"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Plan } from "@prisma/client"
import { Button } from "@/components/ui/button"

interface BillingActionsProps {
  plan: Plan
  hasStripeCustomer: boolean
}

export function BillingActions({ plan, hasStripeCustomer }: BillingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setLoading(false)
    }
  }

  if (plan === "PRO" && hasStripeCustomer) {
    return (
      <Button onClick={handlePortal} disabled={loading} variant="outline">
        {loading ? "Redirecionando..." : "Gerenciar assinatura"}
      </Button>
    )
  }

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? "Redirecionando..." : "Fazer upgrade para Pro"}
    </Button>
  )
}
