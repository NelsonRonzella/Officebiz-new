"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  Headphones,
  LogOut,
  Menu,
  Package,
  Video,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"
import type { Role } from "@prisma/client"

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

function getNavItems(role?: Role): NavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Usuários", href: "/admin/users", icon: Users },
        { label: "Produtos", href: "/admin/produtos", icon: Package },
        { label: "Tutoriais", href: "/admin/tutoriais", icon: Video },
        { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
      ]
    case "LICENCIADO":
      return [
        { label: "Dashboard", href: "/dashboard/licenciado", icon: LayoutDashboard },
        { label: "Clientes", href: "/app/clientes", icon: Users },
        { label: "Produtos", href: "/app/produtos", icon: Package },
        { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
      ]
    case "PRESTADOR":
      return [
        { label: "Dashboard", href: "/dashboard/prestador", icon: LayoutDashboard },
        { label: "Produtos", href: "/app/produtos", icon: Package },
        { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
      ]
    case "CLIENTE":
      return [
        { label: "Dashboard", href: "/dashboard/cliente", icon: LayoutDashboard },
        { label: "Meus Pedidos", href: "/app/pedidos", icon: ClipboardList },
      ]
    default:
      return [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ]
  }
}

function getSecondaryItems(role?: Role): NavItem[] {
  const items: NavItem[] = [
    { label: "Perfil", href: "/settings/profile", icon: User },
  ]

  if (role === "LICENCIADO") {
    items.unshift({ label: "Assinatura", href: "/settings/billing", icon: CreditCard })
  }

  if (role !== "ADMIN") {
    items.push({ label: "Suporte", href: "/suporte", icon: Headphones })
  }

  return items
}

function getDashboardHref(role?: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "LICENCIADO":
      return "/dashboard/licenciado"
    case "PRESTADOR":
      return "/dashboard/prestador"
    case "CLIENTE":
      return "/dashboard/cliente"
    default:
      return "/dashboard"
  }
}

interface SidebarNavProps {
  role?: Role
}

function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const navItems = getNavItems(role)
  const secondaryItems = getSecondaryItems(role)

  return (
    <div className="flex h-full flex-col" style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href={getDashboardHref(role)} className="text-xl font-bold tracking-tight text-white">
          OfficeBiz
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-4 bg-[hsl(var(--sidebar-border))]" />

        {secondaryItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <Separator className="mb-4 bg-[hsl(var(--sidebar-border))]" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--sidebar-foreground))] transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
        >
          <LogOut className="size-5" />
          Sair
        </button>
      </div>
    </div>
  )
}

interface SidebarProps {
  role?: Role
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
        <SidebarNav role={role} />
      </aside>

      {/* Mobile hamburger + Sheet */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-64 p-0">
            <SidebarNav role={role} />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-bold tracking-tight text-foreground">
          OfficeBiz
        </span>
      </div>
    </>
  )
}
