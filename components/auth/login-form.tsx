"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OtpForm } from "./otp-form"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código")
        return
      }

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
            : `Código enviado para ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não é licenciado?{" "}
                <a href="/#pricing" className="text-primary hover:underline">
                  Conheça nossos planos
                </a>
              </p>
            </div>
          </form>
        ) : (
          <OtpForm
            onSubmit={handleVerifyOtp}
            onResend={() => {
              setStep("email")
              handleSendOtp(new Event("submit") as unknown as React.FormEvent)
            }}
            loading={loading}
            error={error}
          />
        )}
      </CardContent>
    </Card>
  )
}
