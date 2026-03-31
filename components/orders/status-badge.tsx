import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pagamento",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  PAGO: {
    label: "Pago",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  RETORNO: {
    label: "Retorno",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  CONCLUIDO: {
    label: "Concluído",
    color: "bg-green-100 text-green-800 border-green-300",
  },
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-muted text-muted-foreground",
  }

  return (
    <Badge variant="outline" className={config.color}>
      {config.label}
    </Badge>
  )
}

export { STATUS_CONFIG }
