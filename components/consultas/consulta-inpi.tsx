"use client"

import { ShieldCheck } from "lucide-react"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { InpiMarcaResponse } from "@/lib/inpi"

function validateProcesso(value: string): string | null {
  const digits = value.replace(/\D/g, "")
  if (digits.length < 7) return "Número do processo deve ter no mínimo 7 dígitos"
  if (digits.length > 12) return "Número do processo deve ter no máximo 12 dígitos"
  return null
}

function InpiResult({ data }: { data: InpiMarcaResponse }) {
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
          <p className="text-muted-foreground">Classificação Nice</p>
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

export function ConsultaInpi() {
  return (
    <ConsultaForm<InpiMarcaResponse>
      title="Consultar Marca no INPI"
      description="Pesquise o status de registro de marcas no Instituto Nacional da Propriedade Industrial"
      icon={ShieldCheck}
      inputLabel="Número do Processo"
      inputPlaceholder="Ex: 123456789"
      maxLength={12}
      apiEndpoint="/api/consultas/inpi"
      validateInput={validateProcesso}
      renderResult={(data) => <InpiResult data={data} />}
    />
  )
}
