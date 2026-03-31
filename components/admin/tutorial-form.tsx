"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getYoutubeThumbnail } from "@/lib/youtube"

interface ProductOption {
  id: string
  name: string
  type: string
}

interface TutorialData {
  id: string
  title: string
  description: string
  link: string
  products: Array<{ id: string; name: string }>
}

interface TutorialFormProps {
  tutorial?: TutorialData
  products: ProductOption[]
}

export function TutorialForm({ tutorial, products }: TutorialFormProps) {
  const router = useRouter()
  const isEdit = !!tutorial

  const [title, setTitle] = useState(tutorial?.title || "")
  const [description, setDescription] = useState(tutorial?.description || "")
  const [link, setLink] = useState(tutorial?.link || "")
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    tutorial?.products.map((p) => p.id) || []
  )
  const [loading, setLoading] = useState(false)

  const thumbnail = useMemo(() => getYoutubeThumbnail(link), [link])

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const body = {
        title,
        description,
        link,
        productIds: selectedProducts,
      }

      const url = isEdit ? `/api/tutorials/${tutorial.id}` : "/api/tutorials"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          isEdit ? "Tutorial atualizado com sucesso" : "Tutorial criado com sucesso"
        )
        router.push("/admin/tutoriais")
        router.refresh()
      } else {
        toast.error(data.error || "Erro ao salvar tutorial")
      }
    } catch {
      toast.error("Erro ao salvar tutorial")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do tutorial</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do tutorial"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do tutorial"
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link do YouTube</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          {thumbnail && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={thumbnail}
                  alt="Thumbnail do vídeo"
                  className="aspect-video w-full max-w-md object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos vinculados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <span className="text-sm text-foreground">{product.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Salvar alterações" : "Criar tutorial"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/tutoriais")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
