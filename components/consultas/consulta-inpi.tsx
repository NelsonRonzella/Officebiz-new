"use client"

import { useState, type FormEvent } from "react"
import { ShieldCheck, Loader2, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import type { InpiMarcaResponse } from "@/lib/inpi"

const NICE_CLASSES = [
  { value: "", label: "Todas as classes" },
  { value: "1", label: "01 — Produtos químicos" },
  { value: "2", label: "02 — Tintas e vernizes" },
  { value: "3", label: "03 — Cosméticos e produtos de limpeza" },
  { value: "4", label: "04 — Óleos e combustíveis industriais" },
  { value: "5", label: "05 — Produtos farmacêuticos" },
  { value: "6", label: "06 — Metais comuns e suas ligas" },
  { value: "7", label: "07 — Máquinas e ferramentas mecânicas" },
  { value: "8", label: "08 — Ferramentas e utensílios manuais" },
  { value: "9", label: "09 — Equipamentos eletrônicos e científicos" },
  { value: "10", label: "10 — Aparelhos médicos e cirúrgicos" },
  { value: "11", label: "11 — Iluminação, aquecimento, refrigeração" },
  { value: "12", label: "12 — Veículos e acessórios" },
  { value: "13", label: "13 — Armas de fogo e munições" },
  { value: "14", label: "14 — Joalheria e relojoaria" },
  { value: "15", label: "15 — Instrumentos musicais" },
  { value: "16", label: "16 — Papel, papelão e impressos" },
  { value: "17", label: "17 — Borracha e plásticos" },
  { value: "18", label: "18 — Couro, bolsas e malas" },
  { value: "19", label: "19 — Materiais de construção" },
  { value: "20", label: "20 — Móveis e decoração" },
  { value: "21", label: "21 — Utensílios domésticos" },
  { value: "22", label: "22 — Cordas, tendas e fibras" },
  { value: "23", label: "23 — Fios para uso têxtil" },
  { value: "24", label: "24 — Tecidos e coberturas" },
  { value: "25", label: "25 — Vestuário, calçados e chapéus" },
  { value: "26", label: "26 — Rendas, bordados e aviamentos" },
  { value: "27", label: "27 — Tapetes e revestimentos" },
  { value: "28", label: "28 — Jogos e brinquedos" },
  { value: "29", label: "29 — Alimentos de origem animal" },
  { value: "30", label: "30 — Alimentos de origem vegetal" },
  { value: "31", label: "31 — Produtos agrícolas e grãos" },
  { value: "32", label: "32 — Cervejas e bebidas não alcoólicas" },
  { value: "33", label: "33 — Bebidas alcoólicas" },
  { value: "34", label: "34 — Tabaco e artigos para fumantes" },
  { value: "35", label: "35 — Publicidade e gestão de negócios" },
  { value: "36", label: "36 — Seguros e serviços financeiros" },
  { value: "37", label: "37 — Construção e reparação" },
  { value: "38", label: "38 — Telecomunicações" },
  { value: "39", label: "39 — Transporte e armazenamento" },
  { value: "40", label: "40 — Tratamento de materiais" },
  { value: "41", label: "41 — Educação e entretenimento" },
  { value: "42", label: "42 — Tecnologia e pesquisa científica" },
  { value: "43", label: "43 — Alimentação e hospedagem" },
  { value: "44", label: "44 — Serviços médicos e veterinários" },
  { value: "45", label: "45 — Serviços jurídicos e segurança" },
]

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
  const [tipoBusca, setTipoBusca] = useState<"exata" | "radical">("exata")
  const [classeNice, setClasseNice] = useState("")
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
      const exata = tipoBusca === "exata" ? "1" : "0"
      const params = new URLSearchParams({ q: query.trim(), exata })
      if (classeNice) params.set("classe", classeNice)

      const res = await fetch(`/api/consultas/inpi/marca?${params.toString()}`)
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
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome da marca */}
            <div className="space-y-2">
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

            {/* Tipo de busca: Exata / Radical */}
            <div className="space-y-2">
              <Label>Tipo de Busca</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoBusca("exata")}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                    tipoBusca === "exata"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm text-foreground">Exata</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Busca o nome exatamente como digitado
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoBusca("radical")}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                    tipoBusca === "radical"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm text-foreground">Radical</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Busca nomes que contenham o termo digitado
                  </p>
                </button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {tipoBusca === "exata" ? (
                  <span>A busca <strong>exata</strong> retorna apenas marcas com o nome idêntico ao digitado. Use para verificar se o nome específico já existe.</span>
                ) : (
                  <span>A busca <strong>radical</strong> retorna marcas que contêm o termo digitado. Ex: buscando &ldquo;nik&rdquo; encontra &ldquo;NIKE&rdquo;, &ldquo;NIKKO&rdquo;, &ldquo;NIKITA&rdquo;, etc. Use para ver nomes similares.</span>
                )}
              </div>
            </div>

            {/* Classe Nice (Especialidade) */}
            <div className="space-y-2">
              <Label htmlFor="classe-nice">Especialidade (Classificação de Nice)</Label>
              <Select value={classeNice || "all"} onValueChange={(v) => setClasseNice(!v || v === "all" ? "" : v)}>
                <SelectTrigger id="classe-nice">
                  <SelectValue placeholder="Todas as classes" />
                </SelectTrigger>
                <SelectContent>
                  {NICE_CLASSES.map((c) => (
                    <SelectItem key={c.value || "all"} value={c.value || "all"}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Pelo <strong>Princípio da Especialidade</strong>, uma mesma marca pode existir em classes diferentes. Ex: &ldquo;Apple&rdquo; existe na classe 09 (eletrônicos) e classe 31 (frutas). Selecione a classe do seu ramo para uma busca mais precisa.</span>
              </p>
            </div>

            <Button type="submit" disabled={isLoading || query.trim().length < 2} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Consultando INPI...
                </>
              ) : (
                "Verificar Disponibilidade"
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

            {/* Results list */}
            {data.resultados.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Marcas encontradas ({data.resultados.length}{data.total > data.resultados.length ? ` de ${data.total}` : ""}):
                  </p>
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
