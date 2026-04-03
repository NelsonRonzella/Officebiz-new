"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, MapPin } from "lucide-react"

const LeadsMapa = dynamic(() => import("./leads-mapa"), { ssr: false })

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
]

const RAIOS = [5, 10, 25, 50, 100]

export interface SearchParams {
  cidade: string
  estado: string
  segmento: string
  raioKm: number
}

interface BuscadorSidebarProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

interface GeoResult {
  lat: string
  lon: string
}

export function BuscadorSidebar({ onSearch, isLoading }: BuscadorSidebarProps) {
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("SP")
  const [segmento, setSegmento] = useState("")
  const [raioKm, setRaioKm] = useState(10)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -23.5505, lng: -46.6333 })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (cidade.length < 3) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}+${estado}+Brazil&format=json&limit=1`,
          { headers: { "User-Agent": "OfficeBiz/1.0" } }
        )
        const data: GeoResult[] = await res.json()
        if (data[0]) {
          setMapCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        }
      } catch {
        // silently ignore
      }
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [cidade, estado])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cidade.trim() || !segmento.trim()) return
    onSearch({ cidade: cidade.trim(), estado, segmento: segmento.trim(), raioKm })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <MapPin className="size-4" />
          Busca de Leads
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="cidade" className="text-xs text-muted-foreground">Cidade</Label>
            <Input
              id="cidade"
              placeholder="Ex: São Paulo"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
            />
          </div>
          <div className="w-20 flex flex-col gap-1">
            <Label htmlFor="estado" className="text-xs text-muted-foreground">Estado</Label>
            <Select value={estado} onValueChange={(v) => v && setEstado(v)}>
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="segmento" className="text-xs text-muted-foreground">Segmento</Label>
          <Input
            id="segmento"
            placeholder="Ex: clínicas odontológicas"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">
            Raio de atuação: <span className="text-foreground font-medium">{raioKm} km</span>
          </Label>
          <div className="flex gap-2 flex-wrap">
            {RAIOS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRaioKm(r)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  raioKm === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md overflow-hidden border">
          <LeadsMapa lat={mapCenter.lat} lng={mapCenter.lng} raioKm={raioKm} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !cidade.trim() || !segmento.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Buscando...
          </>
        ) : (
          <>
            <Search className="size-4 mr-2" />
            Buscar Leads com IA
          </>
        )}
      </Button>
    </form>
  )
}
