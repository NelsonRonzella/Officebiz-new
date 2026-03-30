import type { Role } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { getRoleBadgeColor, getRoleLabel } from "@/lib/permissions"

interface RoleBadgeProps {
  role: Role
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge className={getRoleBadgeColor(role)}>
      {getRoleLabel(role)}
    </Badge>
  )
}
