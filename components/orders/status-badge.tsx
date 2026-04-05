import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "@/lib/order-status"

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
