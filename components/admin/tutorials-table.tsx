"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProductType } from "@prisma/client"

interface LinkedProduct {
  id: string
  name: string
  type: ProductType
}

interface Tutorial {
  id: string
  title: string
  description: string
  link: string
  createdAt: string
  products: LinkedProduct[]
}

interface TutorialsTableProps {
  initialTutorials: Tutorial[]
  initialTotal: number
}

export function TutorialsTable({ initialTutorials, initialTotal }: TutorialsTableProps) {
  const router = useRouter()
  const [tutorials, setTutorials] = useState<Tutorial[]>(initialTutorials)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const limit = 10

  const fetchTutorials = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)

      const res = await fetch(`/api/tutorials?${params}`)
      const data = await res.json()

      if (res.ok) {
        setTutorials(data.tutorials)
        setTotal(data.total)
      } else {
        toast.error(data.error || "Erro ao buscar tutoriais")
      }
    } catch {
      toast.error("Erro ao buscar tutoriais")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutorials()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchTutorials])

  async function handleDelete(tutorialId: string) {
    if (!confirm("Tem certeza que deseja excluir este tutorial?")) return

    setDeletingId(tutorialId)
    try {
      const res = await fetch(`/api/tutorials/${tutorialId}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (res.ok) {
        setTutorials((prev) => prev.filter((t) => t.id !== tutorialId))
        setTotal((prev) => prev - 1)
        toast.success("Tutorial excluído com sucesso")
      } else {
        toast.error(data.error || "Erro ao excluir tutorial")
      }
    } catch {
      toast.error("Erro ao excluir tutorial")
    } finally {
      setDeletingId(null)
    }
  }

  function truncateUrl(url: string, maxLength = 40): string {
    if (url.length <= maxLength) return url
    return url.slice(0, maxLength) + "..."
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Título
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Link
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Produtos vinculados
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Criado em
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : tutorials.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum tutorial encontrado
                </td>
              </tr>
            ) : (
              tutorials.map((tutorial) => (
                <tr
                  key={tutorial.id}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  onClick={() => router.push(`/admin/tutoriais/${tutorial.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {tutorial.title}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    <a
                      href={tutorial.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {truncateUrl(tutorial.link)}
                      <ExternalLink className="size-3" />
                    </a>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {tutorial.products.length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        tutorial.products.map((p) => (
                          <Badge key={p.id} variant="secondary" className="text-xs">
                            {p.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(tutorial.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(tutorial.id)
                      }}
                      disabled={deletingId === tutorial.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingId === tutorial.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
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
            {total} tutorial{total !== 1 ? "is" : ""} encontrado
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
