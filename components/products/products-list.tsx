"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Layers, FolderOpen, ArrowRight } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductTypeBadge } from "@/components/products/product-type-badge"

interface ProductItem {
  id: string
  name: string
  description: string
  price: string
  type: string
  _count: {
    steps: number
    documentCategories: number
  }
}

interface ProductsListProps {
  products: ProductItem[]
  showPrice: boolean
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value))
}

export function ProductsList({ products, showPrice }: ProductsListProps) {
  const [search, setSearch] = useState("")

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return products
    const term = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(term))
  }, [products, search])

  const pontuais = useMemo(
    () => filteredBySearch.filter((p) => p.type === "PONTUAL"),
    [filteredBySearch]
  )

  const recorrentes = useMemo(
    () => filteredBySearch.filter((p) => p.type === "RECORRENTE"),
    [filteredBySearch]
  )

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">
            Todos ({filteredBySearch.length})
          </TabsTrigger>
          <TabsTrigger value="pontual">
            Pontual ({pontuais.length})
          </TabsTrigger>
          <TabsTrigger value="recorrente">
            Recorrente ({recorrentes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <ProductGrid
            products={filteredBySearch}
            showPrice={showPrice}
            emptyMessage={
              search.trim()
                ? "Nenhum produto encontrado para esta busca."
                : "Nenhum produto disponível no momento."
            }
          />
        </TabsContent>

        <TabsContent value="pontual">
          <ProductGrid
            products={pontuais}
            showPrice={showPrice}
            emptyMessage={
              search.trim()
                ? "Nenhum produto pontual encontrado para esta busca."
                : "Nenhum produto pontual disponível."
            }
          />
        </TabsContent>

        <TabsContent value="recorrente">
          <ProductGrid
            products={recorrentes}
            showPrice={showPrice}
            emptyMessage={
              search.trim()
                ? "Nenhum produto recorrente encontrado para esta busca."
                : "Nenhum produto recorrente disponível."
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductGrid({
  products,
  showPrice,
  emptyMessage,
}: {
  products: ProductItem[]
  showPrice: boolean
  emptyMessage: string
}) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
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
  )
}
