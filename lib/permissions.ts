import type { Role } from "@prisma/client"

export function canManageUsers(role: Role): boolean {
  return role === "ADMIN"
}

export function canManageClients(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO"
}

export function canManagePrestadores(role: Role): boolean {
  return role === "LICENCIADO"
}

export function canCreateOrders(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO"
}

export function canToggleUsers(role: Role): boolean {
  return role === "ADMIN"
}

export function canAccessAdmin(role: Role): boolean {
  return role === "ADMIN"
}

export function canAccessBilling(role: Role): boolean {
  return role === "LICENCIADO"
}

export function canManageProducts(role: Role): boolean {
  return role === "ADMIN"
}

export function canViewProducts(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO" || role === "PRESTADOR"
}

export function canViewProductPrice(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO"
}

export function canManageTutorials(role: Role): boolean {
  return role === "ADMIN"
}

export function canViewFinancialDashboard(role: Role): boolean {
  return role === "ADMIN"
}

export function canViewFinancialOrders(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO"
}

export function canViewOwnFinancials(role: Role): boolean {
  return role === "LICENCIADO"
}

export function canViewTutorials(role: Role): boolean {
  return role === "ADMIN" || role === "LICENCIADO" || role === "PRESTADOR"
}

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "LICENCIADO":
      return "/dashboard/licenciado"
    case "PRESTADOR":
      return "/dashboard/prestador"
    case "CLIENTE":
      return "/dashboard/cliente"
  }
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "bg-destructive text-destructive-foreground"
    case "LICENCIADO":
      return "bg-primary text-primary-foreground"
    case "PRESTADOR":
      return "bg-accent text-accent-foreground"
    case "CLIENTE":
      return "bg-secondary text-secondary-foreground"
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "Administrador"
    case "LICENCIADO":
      return "Licenciado"
    case "PRESTADOR":
      return "Prestador"
    case "CLIENTE":
      return "Cliente"
  }
}
