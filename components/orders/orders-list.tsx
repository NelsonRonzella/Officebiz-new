"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { STATUS_CONFIG } from "@/lib/order-status"

interface OrderItem {
  id: string
  status: string
  progresso: number
  createdAt: string
  user: { id: string; name: string | null; email: string }
  product: { id: string; name: string; type: string }
  prestador: { id: string; name: string | null } | null
}

interface OrdersResponse {
  orders: OrderItem[]
  total: number
  page: number
  limit: number
}

export function OrdersList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchOrders = useCallback(async () => {
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
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter)
      }
      if (typeFilter !== "ALL") {
        params.set("productType", typeFilter)
      }

      const res = await fetch(`/api/orders?${params.toString()}`)

      if (!res.ok) {
        throw new Error("Erro ao carregar pedidos")
      }

      const json: OrdersResponse = await res.json()
      setData(json)
    } catch {
      setError("Erro ao carregar pedidos. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, typeFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr))
  }

  function truncateId(id: string): string {
    return id.length > 8 ? id.slice(0, 8) + "..." : id
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pedidos</CardTitle>

        {/* Filters */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as string)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="RETORNO">Retorno</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val as string)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="PONTUAL">Pontual</SelectItem>
              <SelectItem value="RECORRENTE">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {debouncedSearch || statusFilter !== "ALL" || typeFilter !== "ALL"
              ? "Nenhum pedido encontrado para os filtros aplicados."
              : "Nenhum pedido cadastrado ainda."}
          </div>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      #ID
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Prestador
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                      Progresso
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status]
                    return (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/app/pedidos/${order.id}`)}
                        className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {truncateId(order.id)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {order.user.name || order.user.email}
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">{order.product.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {order.product.type === "PONTUAL" ? "Pontual" : "Recorrente"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {statusCfg && (
                            <Badge variant="outline" className={statusCfg.color}>
                              {statusCfg.label}
                            </Badge>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {order.prestador?.name || "Não atribuído"}
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          {order.product.type === "PONTUAL" ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-accent transition-all"
                                  style={{ width: `${order.progresso}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {order.progresso}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data.total > 0 && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando {Math.min((page - 1) * limit + 1, data.total)}–
                  {Math.min(page * limit, data.total)} de {data.total}{" "}
                  {data.total === 1 ? "pedido" : "pedidos"}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 sm:justify-end">
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
      </CardContent>
    </Card>
  )
}
