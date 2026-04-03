"use client"

import { useState, useCallback } from "react"
import { BuscadorSidebar, type SearchParams } from "./buscador-sidebar"
import { BuscadorResultados } from "./buscador-resultados"
import type { LeadResultado } from "@/lib/leads-buscar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function BuscadorLeads() {
  const [leads, setLeads] = useState<LeadResultado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"buscar" | "resultados">("buscar")

  const handleSearch = useCallback(async (params: SearchParams) => {
    setActiveTab("resultados")
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/leads/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Erro ao buscar leads")
        return
      }
      setLeads((data as { leads: LeadResultado[] }).leads)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSalvar = useCallback(async (id: string) => {
    await fetch(`/api/leads/buscar/${id}/salvar`, { method: "PATCH" })
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, salvo: true, ignorado: false } : l))
    )
  }, [])

  const handleIgnorar = useCallback(async (id: string) => {
    await fetch(`/api/leads/buscar/${id}/ignorar`, { method: "PATCH" })
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ignorado: true } : l))
    )
  }, [])

  return (
    <div>
      {/* Mobile: Tabs */}
      <div className="sm:hidden">
        <Tabs value={activeTab} onValueChange={(v) => {
          if (v === "buscar" || v === "resultados") setActiveTab(v)
        }}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="buscar" className="flex-1">Buscar</TabsTrigger>
            <TabsTrigger value="resultados" className="flex-1">
              Resultados{leads.length > 0 ? ` (${leads.length})` : ""}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buscar" keepMounted>
            <BuscadorSidebar onSearch={handleSearch} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="resultados">
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <BuscadorResultados
              leads={leads}
              isLoading={isLoading}
              onSalvar={handleSalvar}
              onIgnorar={handleIgnorar}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop sidebar — CSS responsive layout mounts both instances; desktop is hidden on mobile */}
      <div className="hidden sm:flex gap-6 min-h-[calc(100vh-12rem)]">
        <aside className="w-72 shrink-0">
          <BuscadorSidebar onSearch={handleSearch} isLoading={isLoading} />
        </aside>
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <BuscadorResultados
            leads={leads}
            isLoading={isLoading}
            onSalvar={handleSalvar}
            onIgnorar={handleIgnorar}
          />
        </div>
      </div>
    </div>
  )
}
