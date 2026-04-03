"use client"

import { IconWorld } from "@tabler/icons-react"
import { ConsultaForm } from "@/components/consultas/consulta-form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { BrasilApiDomainResponse } from "@/lib/consultas"

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || ""
  if (s.includes("available") || s.includes("disponível") || s.includes("disponivel")) {
    return <Badge className="bg-success/15 text-success border-success/30">Disponível</Badge>
  }
  if (s.includes("active") || s.includes("published") || s.includes("ativo")) {
    return <Badge variant="destructive">Registrado / Ativo</Badge>
  }
  return <Badge variant="secondary">{status}</Badge>
}

function DomainResult({ data }: { data: BrasilApiDomainResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{data.fqdn}</h3>
        {getStatusBadge(data.status)}
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-medium text-foreground">{data.status || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Código de Status</p>
          <p className="font-medium text-foreground">{data.status_code ?? "—"}</p>
        </div>
        {data.expires_at && (
          <div>
            <p className="text-muted-foreground">Expira em</p>
            <p className="font-medium text-foreground">
              {new Date(data.expires_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
        {data.publication_status && (
          <div>
            <p className="text-muted-foreground">Status de Publicação</p>
            <p className="font-medium text-foreground">{data.publication_status}</p>
          </div>
        )}
      </div>

      {data.fqdns && data.fqdns.length > 1 && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-2">Domínios Relacionados</p>
            <div className="flex flex-wrap gap-2">
              {data.fqdns.map((fqdn) => (
                <Badge key={fqdn} variant="secondary">{fqdn}</Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {data.suggestions && data.suggestions.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sugestões Disponíveis</p>
            <div className="flex flex-wrap gap-2">
              {data.suggestions
                .filter((s) => s.available)
                .map((s) => (
                  <Badge key={s.fqdn} className="bg-success/15 text-success border-success/30">
                    {s.fqdn}
                  </Badge>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function ConsultaDominio() {
  return (
    <ConsultaForm<BrasilApiDomainResponse>
      title="Consultar Domínio"
      description="Verifique se um domínio .BR está ativo ou disponível para registro"
      icon={IconWorld}
      inputLabel="Domínio"
      inputPlaceholder="exemplo.com.br"
      apiEndpoint="/api/consultas/dominio"
      renderResult={(data) => <DomainResult data={data} />}
    />
  )
}
