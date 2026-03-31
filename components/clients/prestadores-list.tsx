"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Prestador {
  id: string
  name: string | null
  email: string
  telefone: string | null
  role: string
  active: boolean
  createdAt: string
}

interface UsersResponse {
  users: Prestador[]
  total: number
  page: number
  limit: number
}

export function PrestadoresList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<UsersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPrestadores = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        role: "PRESTADOR",
        page: String(page),
        limit: String(limit),
      })

      if (debouncedSearch) {
        params.set("search", debouncedSearch)
      }
      if (activeFilter) {
        params.set("active", activeFilter)
      }

      const res = await fetch(`/api/users?${params.toString()}`)

      if (!res.ok) {
        throw new Error("Erro ao carregar prestadores")
      }

      const json: UsersResponse = await res.json()
      setData(json)
    } catch {
      setError("Erro ao carregar prestadores. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch, activeFilter])

  useEffect(() => {
    fetchPrestadores()
  }, [fetchPrestadores])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Lista de Prestadores</CardTitle>
          <Button render={<Link href="/app/prestadores/novo" />}>
            <Plus className="mr-2 size-4" />
            Novo prestador
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={activeFilter}
            onValueChange={(val) => {
              setActiveFilter(val === " " ? "" : (val ?? ""))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
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
        ) : !data || data.users.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {debouncedSearch || activeFilter
              ? "Nenhum prestador encontrado para os filtros aplicados."
              : "Nenhum prestador cadastrado ainda."}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                      Telefone
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Cadastrado em
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((prestador) => (
                    <tr
                      key={prestador.id}
                      onClick={() =>
                        router.push(`/app/prestadores/${prestador.id}`)
                      }
                      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {prestador.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {prestador.email}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {prestador.telefone || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {formatDate(prestador.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.total > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {Math.min((page - 1) * limit + 1, data.total)}–
                  {Math.min(page * limit, data.total)} de {data.total}{" "}
                  {data.total === 1 ? "prestador" : "prestadores"}
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
      </CardContent>
    </Card>
  )
}
