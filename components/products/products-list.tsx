"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Search,
  Layers,
  FolderOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductTypeBadge } from "@/components/products/product-type-badge"

interface ProductItem {
  id: string
  name: string
  description: string
  price: number
  type: string
  _count: {
    steps: number
    documentCategories: number
  }
}

interface ProductsResponse {
  products: ProductItem[]
  total: number
  page: number
  limit: number
}

interface ProductsListProps {
  showPrice: boolean
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function ProductsList({ showPrice }: ProductsListProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 9

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })

      if (debouncedSearch) {
        params.set("search", debouncedSearch)
      }
      if (typeFilter) {
        params.set("type", typeFilter)
      }

      const res = await fetch(`/api/products?${params.toString()}`)

      if (!res.ok) {
        throw new Error("Erro ao carregar produtos")
      }

      const json: ProductsResponse = await res.json()
      setData(json)
    } catch {
      setError("Erro ao carregar produtos. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch, typeFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          defaultValue=""
          onValueChange={(val) => {
            setTypeFilter((val ?? "") as string)
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="">Todos</TabsTrigger>
            <TabsTrigger value="PONTUAL">Pontual</TabsTrigger>
            <TabsTrigger value="RECORRENTE">Recorrente</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produto por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.products.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {debouncedSearch || typeFilter
            ? "Nenhum produto encontrado para os filtros aplicados."
            : "Nenhum produto disponível no momento."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.products.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <ProductTypeBadge type={product.type} />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-2">
                    {showPrice && (
                      <p className="text-lg font-semibold text-foreground">
                        {formatPrice(product.price)}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {product.type === "PONTUAL" ? (
                        <>
                          <Layers className="size-4" />
                          <span>
                            {product._count.steps}{" "}
                            {product._count.steps === 1 ? "etapa" : "etapas"}
                          </span>
                        </>
                      ) : (
                        <>
                          <FolderOpen className="size-4" />
                          <span>
                            {product._count.documentCategories}{" "}
                            {product._count.documentCategories === 1
                              ? "categoria"
                              : "categorias"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href={`/app/produtos/${product.id}`} />}
                  >
                    Ver detalhes
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.total > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {Math.min((page - 1) * limit + 1, data.total)}–
                {Math.min(page * limit, data.total)} de {data.total} produto
                {data.total !== 1 ? "s" : ""}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
