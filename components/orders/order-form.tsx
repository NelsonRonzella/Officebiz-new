"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ClientOption {
  id: string
  name: string | null
  email: string
}

interface ProductOption {
  id: string
  name: string
  type: string
  price: string
}

interface OrderFormProps {
  clients: ClientOption[]
  products: ProductOption[]
}

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function OrderForm({ clients, products }: OrderFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState<string>("")
  const [productId, setProductId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!clientId || !productId) {
      toast.error("Selecione o cliente e o produto.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: clientId,
          productId,
          message: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erro ao criar pedido")
      }

      const data = await res.json()
      toast.success("Pedido criado com sucesso!")
      router.push(`/app/pedidos/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar pedido")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client select */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={clientId}
              onValueChange={(val) => setClientId(val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name || client.email}
                    {client.name && (
                      <span className="ml-2 text-muted-foreground">
                        ({client.email})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product select */}
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select
              value={productId}
              onValueChange={(val) => setProductId(val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.type === "PONTUAL" ? "Pontual" : "Recorrente"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {priceFormatter.format(Number(product.price))}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial message */}
          <div className="space-y-2">
            <Label>Mensagem inicial (opcional)</Label>
            <Textarea
              placeholder="Escreva uma mensagem inicial para o pedido..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Criar Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
