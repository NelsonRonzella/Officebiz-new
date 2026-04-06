"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CLOSER_WHATSAPP } from "@/lib/pricing"

export function GeneratePaymentLinkButton({
  userId,
  userPhone,
  fallbackWhatsapp,
}: {
  userId: string
  userPhone: string | null
  fallbackWhatsapp?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/payment-link`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha")
      setUrl(data.url)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const waHref = url
    ? `https://wa.me/${(userPhone || fallbackWhatsapp || CLOSER_WHATSAPP).replace(/\D/g, "")}?text=${encodeURIComponent(
        `Segue o link de pagamento da sua licença OfficeBiz: ${url}`
      )}`
    : null

  return (
    <div className="space-y-2">
      <Button onClick={generate} disabled={loading}>
        {loading ? "Gerando..." : "Gerar link de pagamento"}
      </Button>
      {url && (
        <>
          <input
            readOnly
            value={url}
            className="w-full rounded border px-2 py-1 text-sm"
            onFocus={(e) => e.currentTarget.select()}
          />
          <a
            href={waHref!}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            Enviar por WhatsApp
          </a>
        </>
      )}
    </div>
  )
}
