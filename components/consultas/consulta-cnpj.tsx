"use client"

import { Building2 } from "lucide-react"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { BrasilApiCnpjResponse } from "@/lib/consultas"

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

function validateCnpj(value: string): string | null {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 14) return "CNPJ deve ter 14 dígitos"
  return null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function CnpjResult({ data }: { data: BrasilApiCnpjResponse }) {
  const isAtiva = data.descricao_situacao_cadastral?.toUpperCase() === "ATIVA"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {data.razao_social}
        </h3>
        <Badge variant={isAtiva ? "default" : "destructive"}>
          {data.descricao_situacao_cadastral}
        </Badge>
      </div>

      {data.nome_fantasia && (
        <p className="text-sm text-muted-foreground">
          Nome Fantasia: <strong className="text-foreground">{data.nome_fantasia}</strong>
        </p>
      )}

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">CNPJ</p>
          <p className="font-medium text-foreground">{maskCnpj(data.cnpj)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Início Atividade</p>
          <p className="font-medium text-foreground">{data.data_inicio_atividade || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Natureza Jurídica</p>
          <p className="font-medium text-foreground">{data.natureza_juridica || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Porte</p>
          <p className="font-medium text-foreground">{data.porte || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Capital Social</p>
          <p className="font-medium text-foreground">{formatCurrency(data.capital_social)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">CNAE Principal</p>
          <p className="font-medium text-foreground">{data.cnae_fiscal_descricao || "—"}</p>
        </div>
      </div>

      <Separator />

      <div className="text-sm">
        <p className="text-muted-foreground mb-1">Endereço</p>
        <p className="font-medium text-foreground">
          {data.logradouro}, {data.numero}
          {data.complemento ? ` - ${data.complemento}` : ""} — {data.bairro}, {data.municipio}/{data.uf} — CEP {data.cep}
        </p>
      </div>

      {(data.ddd_telefone_1 || data.email) && (
        <>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {data.ddd_telefone_1 && (
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium text-foreground">{data.ddd_telefone_1}</p>
              </div>
            )}
            {data.email && (
              <div>
                <p className="text-muted-foreground">E-mail</p>
                <p className="font-medium text-foreground">{data.email}</p>
              </div>
            )}
          </div>
        </>
      )}

      {data.qsa && data.qsa.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quadro Societário</p>
            <div className="space-y-2">
              {data.qsa.map((socio, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{socio.nome_socio}</span>
                  <Badge variant="secondary" className="text-xs">{socio.qualificacao_socio}</Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function ConsultaCnpj() {
  return (
    <ConsultaForm<BrasilApiCnpjResponse>
      title="Consultar CNPJ"
      description="Consulte dados de empresas na Receita Federal"
      icon={Building2}
      inputLabel="CNPJ"
      inputPlaceholder="00.000.000/0000-00"
      inputMask={maskCnpj}
      maxLength={18}
      apiEndpoint="/api/consultas/cnpj"
      validateInput={validateCnpj}
      renderResult={(data) => <CnpjResult data={data} />}
    />
  )
}
