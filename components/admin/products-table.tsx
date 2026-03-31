"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductTypeBadge } from "@/components/products/product-type-badge"
import type { ProductType } from "@prisma/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  type: ProductType
  active: boolean
  createdAt: string
  _count: {
    steps: number
    documentCategories: number
  }
}

interface ProductsTableProps {
  initialProducts: Product[]
  initialTotal: number
}

const TYPE_TABS = [
  { label: "Todos", value: "" },
  { label: "Pontual", value: "PONTUAL" },
  { label: "Recorrente", value: "RECORRENTE" },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)

export function ProductsTable({ initialProducts, initialTotal }: ProductsTableProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const limit = 10

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (typeFilter) params.set("type", typeFilter)
      if (activeFilter) params.set("active", activeFilter)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()

      if (res.ok) {
        setProducts(data.products)
        setTotal(data.total)
      } else {
        toast.error(data.error || "Erro ao buscar produtos")
      }
    } catch {
      toast.error("Erro ao buscar produtos")
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, activeFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  async function handleToggle(productId: string) {
    setTogglingId(productId)
    try {
      const res = await fetch(`/api/products/${productId}/toggle`, {
        method: "PATCH",
      })
      const data = await res.json()

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, active: data.active } : p))
        )
        toast.success(
          data.active ? "Produto ativado" : "Produto desativado"
        )
      } else {
        toast.error(data.error || "Erro ao alterar status")
      }
    } catch {
      toast.error("Erro ao alterar status")
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          defaultValue=""
          onValueChange={(val) => {
            setTypeFilter((val ?? "") as string)
            setPage(1)
          }}
        >
          <TabsList>
            {TYPE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select
            value={activeFilter}
            onValueChange={(val) => {
              setActiveFilter(val ?? "")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Tipo
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Preço
              </th>
              <th className="hidden px-4 py-3 text-center text-sm font-medium text-muted-foreground lg:table-cell">
                Etapas/Categorias
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Ativo
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Criado em
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  onClick={() => router.push(`/admin/produtos/${product.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <ProductTypeBadge type={product.type} />
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm text-muted-foreground lg:table-cell">
                    {product.type === "PONTUAL"
                      ? `${product._count.steps} etapa${product._count.steps !== 1 ? "s" : ""}`
                      : `${product._count.documentCategories} categoria${product._count.documentCategories !== 1 ? "s" : ""}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(product.id)
                      }}
                      disabled={togglingId === product.id}
                      className="inline-flex items-center"
                      aria-label={product.active ? "Desativar" : "Ativar"}
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          product.active ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                            product.active ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} produto{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
