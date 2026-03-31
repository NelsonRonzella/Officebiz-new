import { Badge } from "@/components/ui/badge"
interface ProductTypeBadgeProps {
  type: string
}

export function ProductTypeBadge({ type }: ProductTypeBadgeProps) {
  if (type === "PONTUAL") {
    return (
      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">
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
