import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pagamento",
    color: "bg-warning/15 text-warning border-warning/30",
  },
  PAGO: {
    label: "Pago",
    color: "bg-success/15 text-success border-success/30",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  RETORNO: {
    label: "Retorno",
    color: "bg-secondary text-secondary-foreground border-border",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-destructive/15 text-destructive border-destructive/30",
  },
  CONCLUIDO: {
    label: "Concluído",
    color: "bg-success/15 text-success border-success/30",
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
