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

interface Category {
  title: string
  description: string
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
  documentCategories: Array<{
    title: string
    description: string
    order: number
  }>
  tutorials: Array<{ id: string; title: string }>
}

interface ProductFormRecorrenteProps {
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

export function ProductFormRecorrente({ product, tutorials }: ProductFormRecorrenteProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [priceDisplay, setPriceDisplay] = useState(
    product ? product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"
  )
  const [categories, setCategories] = useState<Category[]>(
    product?.documentCategories.map((c) => ({
      title: c.title,
      description: c.description,
    })) || [{ title: "", description: "" }]
  )
  const [selectedTutorials, setSelectedTutorials] = useState<string[]>(
    product?.tutorials.map((t) => t.id) || []
  )
  const [loading, setLoading] = useState(false)

  function handlePriceChange(value: string) {
    setPriceDisplay(formatPriceInput(value))
  }

  function addCategory() {
    setCategories([...categories, { title: "", description: "" }])
  }

  function removeCategory(index: number) {
    if (categories.length <= 1) return
    setCategories(categories.filter((_, i) => i !== index))
  }

  function updateCategory(index: number, field: keyof Category, value: string) {
    setCategories(categories.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  function moveCategory(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return
    const newCategories = [...categories]
    ;[newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]]
    setCategories(newCategories)
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
        type: "RECORRENTE" as const,
        categories: categories.map((c, index) => ({
          title: c.title,
          description: c.description,
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
            <Label htmlFor="price">Preço mensal (R$)</Label>
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
          <CardTitle>Categorias de documentos</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addCategory}>
            <Plus className="mr-1 size-4" />
            Adicionar categoria
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category, index) => (
            <div key={index}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start gap-2">
                <div className="flex-1 grid gap-3 sm:grid-cols-1">
                  <div className="space-y-2">
                    <Label>Categoria {index + 1} — Título</Label>
                    <Input
                      value={category.title}
                      onChange={(e) => updateCategory(index, "title", e.target.value)}
                      placeholder="Título da categoria"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={category.description}
                      onChange={(e) => updateCategory(index, "description", e.target.value)}
                      placeholder="Descrição da categoria"
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
                    onClick={() => moveCategory(index, "up")}
                    disabled={index === 0}
                    className="size-8"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCategory(index, "down")}
                    disabled={index === categories.length - 1}
                    className="size-8"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(index)}
                    disabled={categories.length <= 1}
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
