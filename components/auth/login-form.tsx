"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageCircle } from "lucide-react"
import { OtpForm } from "./otp-form"

type Channel = "email" | "whatsapp"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasPhone, setHasPhone] = useState(false)
  const [sentVia, setSentVia] = useState<Channel>("email")
  const router = useRouter()

  async function handleSendOtp(channel: Channel) {
    if (!email.trim()) {
      setError("Informe seu email")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channel }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código")
        return
      }

      setHasPhone(data.hasPhone ?? false)
      setSentVia(channel)
      setStep("otp")
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(code: string) {
    setLoading(true)
    setError("")

    try {
      const result = await signIn("otp", {
        email,
        code,
        redirect: false,
      })

      if (result?.error) {
        setError("Código inválido ou expirado.")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Erro ao verificar código.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          OfficeBiz
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Acesse sua conta"
            : sentVia === "whatsapp"
              ? `Código enviado por WhatsApp`
              : `Código enviado para ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSendOtp("email")
                  }
                }}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Enviar código por:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSendOtp("email")}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                <Mail className="mr-2 size-4" />
                {loading ? "Enviando..." : "E-mail"}
              </Button>
              <Button
                onClick={() => handleSendOtp("whatsapp")}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="mr-2 size-4" />
                {loading ? "Enviando..." : "WhatsApp"}
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não é licenciado?{" "}
                <a href="/#pricing" className="text-primary hover:underline">
                  Conheça nossos planos
                </a>
              </p>
            </div>
          </div>
        ) : (
          <OtpForm
            onSubmit={handleVerifyOtp}
            onResend={() => {
              setStep("email")
            }}
            loading={loading}
            error={error}
          />
        )}
      </CardContent>
    </Card>
  )
}
