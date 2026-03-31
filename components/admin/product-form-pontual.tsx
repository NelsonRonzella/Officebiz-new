"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

interface Step {
  title: string
  description: string
  durationDays: number
}

interface TutorialOption {
  id: string
  title: string
}

interface ProductData {
  id: string
  name: string
  description: string
  price: number
  steps: Array<{
    title: string
    description: string
    durationDays: number
    order: number
  }>
  tutorials: Array<{ id: string; title: string }>
}

interface ProductFormPontualProps {
  product?: ProductData
  tutorials: TutorialOption[]
}

function formatPriceInput(value: string): string {
  const digits = value.replace(/\D/g, "")
  const num = parseInt(digits || "0", 10) / 100
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parsePriceInput(formatted: string): number {
  const cleaned = formatted.replace(/\./g, "").replace(",", ".")
  return parseFloat(cleaned) || 0
}

export function ProductFormPontual({ product, tutorials }: ProductFormPontualProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [priceDisplay, setPriceDisplay] = useState(
    product ? product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"
  )
  const [steps, setSteps] = useState<Step[]>(
    product?.steps.map((s) => ({
      title: s.title,
      description: s.description,
      durationDays: s.durationDays,
    })) || [{ title: "", description: "", durationDays: 1 }]
  )
  const [selectedTutorials, setSelectedTutorials] = useState<string[]>(
    product?.tutorials.map((t) => t.id) || []
  )
  const [loading, setLoading] = useState(false)

  function handlePriceChange(value: string) {
    setPriceDisplay(formatPriceInput(value))
  }

  function addStep() {
    setSteps([...steps, { title: "", description: "", durationDays: 1 }])
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  function updateStep(index: number, field: keyof Step, value: string | number) {
    setSteps(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function moveStep(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= steps.length) return
    const newSteps = [...steps]
    ;[newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
    setSteps(newSteps)
  }

  function toggleTutorial(tutorialId: string) {
    setSelectedTutorials((prev) =>
      prev.includes(tutorialId)
        ? prev.filter((id) => id !== tutorialId)
        : [...prev, tutorialId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const price = parsePriceInput(priceDisplay)

      const body = {
        name,
        description,
        price,
        type: "PONTUAL" as const,
        steps: steps.map((s, index) => ({
          title: s.title,
          description: s.description,
          durationDays: s.durationDays,
          order: index,
        })),
        tutorialIds: selectedTutorials,
      }

      const url = isEdit ? `/api/products/${product.id}` : "/api/products"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          isEdit ? "Produto atualizado com sucesso" : "Produto criado com sucesso"
        )
        router.push("/admin/produtos")
        router.refresh()
      } else {
        toast.error(data.error || "Erro ao salvar produto")
      }
    } catch {
      toast.error("Erro ao salvar produto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição detalhada do produto"
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              value={priceDisplay}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Etapas do serviço</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="mr-1 size-4" />
            Adicionar etapa
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={index}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start gap-2">
                <div className="flex-1 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Etapa {index + 1} — Título</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Título da etapa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (dias)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={step.durationDays}
                      onChange={(e) =>
                        updateStep(index, "durationDays", parseInt(e.target.value) || 1)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-3">
                    <Label>Descrição</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      placeholder="Descrição da etapa"
                      rows={2}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 pt-7">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                    className="size-8"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(index, "down")}
                    disabled={index === steps.length - 1}
                    className="size-8"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length <= 1}
                    className="size-8 text-destructive hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {tutorials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tutoriais vinculados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tutorials.map((tutorial) => (
              <label
                key={tutorial.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTutorials.includes(tutorial.id)}
                  onCheckedChange={() => toggleTutorial(tutorial.id)}
                />
                <span className="text-sm text-foreground">{tutorial.title}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/produtos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
