"use client"

import { LeadCard } from "./lead-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import type { LeadResultado } from "@/lib/leads-buscar"

interface BuscadorResultadosProps {
  leads: LeadResultado[]
  isLoading: boolean
  onSalvar: (id: string) => Promise<void>
  onIgnorar: (id: string) => Promise<void>
}

export function BuscadorResultados({ leads, isLoading, onSalvar, onIgnorar }: BuscadorResultadosProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-muted-foreground">
        <Search className="size-10 opacity-20" />
        <p className="text-sm">Preencha cidade e segmento e clique em <strong>Buscar</strong></p>
      </div>
    )
  }

  const novos = leads.filter((l) => !l.jaEncontrado && !l.ignorado)
  const jaEncontrados = leads.filter((l) => l.jaEncontrado)

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 14rem)" }}>
      <p className="text-xs text-muted-foreground">
        {novos.length} novo{novos.length !== 1 ? "s" : ""} · {jaEncontrados.length} já encontrado{jaEncontrados.length !== 1 ? "s" : ""}
      </p>

      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onSalvar={onSalvar}
          onIgnorar={onIgnorar}
        />
      ))}
    </div>
  )
}
