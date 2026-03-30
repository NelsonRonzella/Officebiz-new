"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProfileFormProps {
  initialData: ProfileInput
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState(initialData.name)
  const [phone, setPhone] = useState(initialData.phone)
  const [companyName, setCompanyName] = useState(initialData.companyName)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = profileSchema.safeParse({ name, phone, companyName })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, companyName }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar")
      }

      toast.success("Perfil atualizado com sucesso!")
      router.refresh()
    } catch {
      toast.error("Ocorreu um erro ao salvar o perfil.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
