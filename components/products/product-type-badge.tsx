import { Badge } from "@/components/ui/badge"
interface ProductTypeBadgeProps {
  type: string
}

export function ProductTypeBadge({ type }: ProductTypeBadgeProps) {
  if (type === "PONTUAL") {
    return (
      <Badge variant="outline" className="border-info/30 bg-info/10 text-info dark:text-info">
        Pontual
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400">
      Recorrente
    </Badge>
  )
}
