"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingStep1Input,
  type OnboardingStep2Input,
} from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface OnboardingWizardProps {
  initialData?: {
    name?: string | null
    phone?: string | null
    companyName?: string | null
    companyLogo?: string | null
  }
}

export function OnboardingWizard({ initialData }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1 fields
  const [name, setName] = useState(initialData?.name ?? "")
  const [phone, setPhone] = useState(initialData?.phone ?? "")

  // Step 2 fields
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "")
  const [companyLogo, setCompanyLogo] = useState(initialData?.companyLogo ?? "")

  function validateStep1(): boolean {
    const result = onboardingStep1Schema.safeParse({ name, phone })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  function validateStep2(): boolean {
    const result = onboardingStep2Schema.safeParse({ companyName, companyLogo: companyLogo || undefined })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  function handleNext() {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  function handleBack() {
    setErrors({})
    setStep((prev) => Math.max(1, prev - 1))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          companyName,
          companyLogo: companyLogo || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar dados")
      }

      const data = await res.json()
      const roleRedirects: Record<string, string> = {
        ADMIN: "/admin",
        LICENCIADO: "/dashboard/licenciado",
        PRESTADOR: "/dashboard/prestador",
        CLIENTE: "/dashboard/cliente",
      }
      router.push(roleRedirects[data.role] || "/dashboard")
      router.refresh()
    } catch {
      setErrors({ submit: "Ocorreu um erro. Tente novamente." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercent = Math.round((step / 3) * 100)

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Configurar sua conta</CardTitle>
        <CardDescription>
          Etapa {step} de 3
        </CardDescription>
        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Logo da empresa (opcional)</Label>
              <Input
                id="companyLogo"
                type="url"
                placeholder="https://exemplo.com/logo.png"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
              />
              {errors.companyLogo && (
                <p className="text-sm text-destructive">{errors.companyLogo}</p>
              )}
            </div>
          </>
        )}

        {/* Step 3 — Summary */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Confira seus dados antes de continuar:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span className="font-medium">Nome:</span> {name}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span className="font-medium">WhatsApp:</span> {phone}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span className="font-medium">Empresa:</span> {companyName}
              </li>
              {companyLogo && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-accent" />
                  <span className="font-medium">Logo:</span> Definida
                </li>
              )}
            </ul>
            {errors.submit && (
              <p className="text-sm text-destructive">{errors.submit}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext}>Próximo</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Começar a usar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
