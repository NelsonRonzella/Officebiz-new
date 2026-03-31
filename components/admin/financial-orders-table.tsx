"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency, getStatusLabel, formatDate } from "@/lib/financial"

interface FinancialOrder {
  id: string
  status: string
  costPrice: number
  salePrice: number
  profit: number
  marginPercent: number
  createdAt: string
  user: { name: string | null; email: string }
  product: { name: string }
  criador: { name: string | null }
}

interface OrdersResponse {
  orders: FinancialOrder[]
  total: number
  page: number
  limit: number
}

export function FinancialOrdersTable() {
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      if (dateStart) params.set("dateStart", dateStart)
      if (dateEnd) params.set("dateEnd", dateEnd)

      const res = await fetch(`/api/financial/orders?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, dateStart, dateEnd])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  function exportCSV() {
    if (!data?.orders.length) return

    const headers = [
      "Pedido",
      "Cliente",
      "Produto",
      "Custo",
      "Venda",
      "Lucro",
      "Margem%",
      "Status",
      "Data",
    ]

    const rows = data.orders.map((o) => [
      o.id,
      o.user.name || o.user.email,
      o.product.name,
      o.costPrice.toFixed(2),
      o.salePrice.toFixed(2),
      o.profit.toFixed(2),
      o.marginPercent.toFixed(1),
      getStatusLabel(o.status),
      formatDate(new Date(o.createdAt)),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `financeiro-pedidos-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 1

  const statuses = [
    { value: "", label: "Todos" },
    { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando Pagamento" },
    { value: "EM_ANDAMENTO", label: "Em Andamento" },
    { value: "PAGO", label: "Pago" },
    { value: "CONCLUIDO", label: "Concluído" },
    { value: "CANCELADO", label: "Cancelado" },
    { value: "RETORNO", label: "Retorno" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Pedidos — Visão Financeira</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          disabled={!data?.orders.length}
        >
          <Download className="mr-2 size-4" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente ou produto..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" size="sm">
              Buscar
            </Button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value)
                setPage(1)
              }}
              className="w-36"
            />
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value)
                setPage(1)
              }}
              className="w-36"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Pedido
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Custo
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Venda
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Lucro
                    </th>
                    <th className="hidden px-4 py-3 text-right text-sm font-medium text-muted-foreground lg:table-cell">
                      Margem%
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.orders.length ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  ) : (
                    data.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                          {order.id.slice(-6)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {order.user.name || order.user.email}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-foreground md:table-cell">
                          {order.product.name}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {formatCurrency(order.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {formatCurrency(order.salePrice)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right text-sm font-medium ${
                            order.profit >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {formatCurrency(order.profit)}
                        </td>
                        <td className="hidden px-4 py-3 text-right text-sm text-muted-foreground lg:table-cell">
                          {order.marginPercent.toFixed(1)}%
                        </td>
                        <td className="hidden px-4 py-3 text-sm sm:table-cell">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                          {formatDate(new Date(order.createdAt))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total > limit && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {data.total} pedido{data.total !== 1 ? "s" : ""} encontrado
                  {data.total !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
