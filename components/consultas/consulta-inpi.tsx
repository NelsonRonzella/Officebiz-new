"use client"

import { useState, type FormEvent } from "react"
import { ShieldCheck, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import type { InpiMarcaResponse } from "@/lib/inpi"

// --- Search by name ---

interface InpiNomeResult {
  consulta: string
  total: number
  disponivel: boolean
  mensagem: string
  resultados: {
    numero: string
    marca: string
    situacao: string
    titular: string
    classe: string
  }[]
}

function getSituacaoBadge(situacao: string) {
  const s = situacao.toLowerCase()
  if (s.includes("vigor") || s.includes("alto renome")) {
    return <Badge variant="destructive" className="text-xs">{situacao}</Badge>
  }
  if (s.includes("extinto") || s.includes("arquivado")) {
    return <Badge variant="secondary" className="text-xs">{situacao}</Badge>
  }
  return <Badge className="text-xs">{situacao}</Badge>
}

function InpiNomeBusca() {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<InpiNomeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setData(null)

    if (query.trim().length < 2) {
      setError("Nome da marca deve ter pelo menos 2 caracteres")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/consultas/inpi/marca?q=${encodeURIComponent(query.trim())}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Erro ao consultar INPI")
        return
      }
      setData(json)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Verificar Disponibilidade de Marca</h2>
              <p className="text-sm text-muted-foreground">Pesquise se um nome já está registrado no INPI</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="marca-input">Nome da Marca</Label>
              <Input
                id="marca-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: OfficeBiz, Nike, Coca-Cola..."
                maxLength={40}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || query.trim().length < 2}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Consultar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardContent className="py-6 space-y-4">
            {/* Status banner */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${data.disponivel ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
              {data.disponivel ? (
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${data.disponivel ? "text-green-800" : "text-amber-800"}`}>
                  {data.disponivel ? "Nome possivelmente disponível" : `${data.total} marca(s) encontrada(s)`}
                </p>
                <p className={`text-sm ${data.disponivel ? "text-green-700" : "text-amber-700"}`}>
                  {data.mensagem}
                </p>
              </div>
            </div>

            {/* Results table */}
            {data.resultados.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Marcas encontradas:</p>
                  <div className="space-y-2">
                    {data.resultados.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{r.marca}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {r.titular}{r.numero ? ` — Nº ${r.numero}` : ""}
                            {r.classe ? ` — Classe ${r.classe}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 ml-3">
                          {getSituacaoBadge(r.situacao)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.total > 20 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Mostrando 20 de {data.total} resultados
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// --- Search by process number ---

function validateProcesso(value: string): string | null {
  const digits = value.replace(/\D/g, "")
  if (digits.length < 7) return "Número do processo deve ter no mínimo 7 dígitos"
  if (digits.length > 12) return "Número do processo deve ter no máximo 12 dígitos"
  return null
}

function InpiProcessoResult({ data }: { data: InpiMarcaResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{data.marca}</h3>
        <Badge variant="secondary">{data.situacao}</Badge>
      </div>
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Nº Processo</p>
          <p className="font-medium text-foreground">{data.numeroProcesso}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Titular</p>
          <p className="font-medium text-foreground">{data.titular}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Natureza</p>
          <p className="font-medium text-foreground">{data.natureza}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Apresentação</p>
          <p className="font-medium text-foreground">{data.apresentacao}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Classificação</p>
          <p className="font-medium text-foreground">{data.classificacaoNice}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Data de Depósito</p>
          <p className="font-medium text-foreground">{data.dataDeposito}</p>
        </div>
        {data.dataConcessao !== "—" && (
          <div>
            <p className="text-muted-foreground">Data de Concessão</p>
            <p className="font-medium text-foreground">{data.dataConcessao}</p>
          </div>
        )}
        {data.vigencia !== "—" && (
          <div>
            <p className="text-muted-foreground">Vigência</p>
            <p className="font-medium text-foreground">{data.vigencia}</p>
          </div>
        )}
      </div>
      {data.procurador !== "—" && (
        <>
          <Separator />
          <div className="text-sm">
            <p className="text-muted-foreground">Procurador</p>
            <p className="font-medium text-foreground">{data.procurador}</p>
          </div>
        </>
      )}
    </div>
  )
}

// --- Main component with tabs ---

export function ConsultaInpi() {
  return (
    <Tabs defaultValue="nome" className="space-y-6">
      <TabsList>
        <TabsTrigger value="nome">Buscar por Nome</TabsTrigger>
        <TabsTrigger value="processo">Buscar por Processo</TabsTrigger>
      </TabsList>

      <TabsContent value="nome">
        <InpiNomeBusca />
      </TabsContent>

      <TabsContent value="processo">
        <ConsultaForm<InpiMarcaResponse>
          title="Consultar Processo INPI"
          description="Pesquise pelo número do processo de registro de marca"
          icon={ShieldCheck}
          inputLabel="Número do Processo"
          inputPlaceholder="Ex: 123456789"
          maxLength={12}
          apiEndpoint="/api/consultas/inpi"
          validateInput={validateProcesso}
          renderResult={(data) => <InpiProcessoResult data={data} />}
        />
      </TabsContent>
    </Tabs>
  )
}
