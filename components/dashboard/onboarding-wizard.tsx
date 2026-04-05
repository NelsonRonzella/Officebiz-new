"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingStep1Input,
  type OnboardingStep2Input,
} from "@/lib/validations"
import { maskPhone, unmaskPhone } from "@/lib/masks"
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
import { CheckCircle2, Upload, Loader2, X } from "lucide-react"

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
  const [phone, setPhone] = useState(maskPhone(initialData?.phone ?? ""))

  // Step 2 fields
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "")
  const [companyLogo, setCompanyLogo] = useState(initialData?.companyLogo ?? "")
  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function handleLogoUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ companyLogo: "Arquivo muito grande. Máximo 2MB." })
      return
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setErrors({ companyLogo: "Formato inválido. Use JPG, PNG, WebP ou SVG." })
      return
    }

    setUploadingLogo(true)
    setErrors({})
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erro ao fazer upload")
      }
      const data = await res.json()
      setCompanyLogo(data.url)
    } catch (err) {
      setErrors({ companyLogo: err instanceof Error ? err.message : "Erro ao fazer upload" })
    } finally {
      setUploadingLogo(false)
    }
  }

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
          phone: unmaskPhone(phone),
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
                onChange={(e) => setPhone(maskPhone(e.target.value))}
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
              <Label>Logo da empresa (opcional)</Label>
              {companyLogo ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded-lg border">
                    <img
                      src={companyLogo}
                      alt="Logo"
                      className="size-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompanyLogo("")}
                  >
                    <X className="mr-1 size-4" />
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                  {uploadingLogo ? (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="size-6 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingLogo ? "Enviando..." : "Clique para enviar (JPG, PNG, WebP — máx 2MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                  />
                </label>
              )}
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
                  <span className="font-medium">Logo:</span>
                  <div className="relative size-8 overflow-hidden rounded border">
                    <img src={companyLogo} alt="Logo" className="size-full object-contain" />
                  </div>
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
