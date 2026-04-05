"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  DollarSign,
  Building2,
  Globe,
  ShieldCheck,
  MapPin,
  CreditCard,
  User,
  Headphones,
  LogOut,
  MoreHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@prisma/client"

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

interface BottomBarConfig {
  fixed: NavItem[]
  more: NavItem[]
}

function getBottomBarConfig(role?: Role): BottomBarConfig {
  switch (role) {
    case "ADMIN":
      return {
        fixed: [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
          { label: "Usuarios", href: "/admin/users", icon: Users },
          { label: "Produtos", href: "/admin/produtos", icon: Package },
        ],
        more: [
          { label: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
          { label: "Tutoriais", href: "/admin/tutoriais", icon: Package },
          { label: "CNPJ", href: "/admin/consultas/cnpj", icon: Building2 },
          { label: "Dominio", href: "/admin/consultas/dominio", icon: Globe },
          { label: "INPI", href: "/admin/consultas/inpi", icon: ShieldCheck },
          { label: "Leads", href: "/admin/leads", icon: MapPin },
          { label: "Perfil", href: "/admin/profile", icon: User },
          { label: "Suporte", href: "/suporte", icon: Headphones },
        ],
      }
    case "LICENCIADO":
      return {
        fixed: [
          { label: "Dashboard", href: "/dashboard/licenciado", icon: LayoutDashboard },
          { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
          { label: "Clientes", href: "/app/clientes", icon: Users },
          { label: "Produtos", href: "/app/produtos", icon: Package },
        ],
        more: [
          { label: "Financeiro", href: "/app/financeiro", icon: DollarSign },
          { label: "CNPJ", href: "/app/consultas/cnpj", icon: Building2 },
          { label: "Dominio", href: "/app/consultas/dominio", icon: Globe },
          { label: "INPI", href: "/app/consultas/inpi", icon: ShieldCheck },
          { label: "Leads", href: "/app/leads", icon: MapPin },
          { label: "Assinatura", href: "/settings/billing", icon: CreditCard },
          { label: "Perfil", href: "/settings/profile", icon: User },
          { label: "Suporte", href: "/suporte", icon: Headphones },
        ],
      }
    case "PRESTADOR":
      return {
        fixed: [
          { label: "Dashboard", href: "/dashboard/prestador", icon: LayoutDashboard },
          { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
          { label: "Produtos", href: "/app/produtos", icon: Package },
          { label: "CNPJ", href: "/app/consultas/cnpj", icon: Building2 },
        ],
        more: [
          { label: "Dominio", href: "/app/consultas/dominio", icon: Globe },
          { label: "INPI", href: "/app/consultas/inpi", icon: ShieldCheck },
          { label: "Perfil", href: "/settings/profile", icon: User },
          { label: "Suporte", href: "/suporte", icon: Headphones },
        ],
      }
    case "CLIENTE":
      return {
        fixed: [
          { label: "Dashboard", href: "/dashboard/cliente", icon: LayoutDashboard },
          { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
          { label: "Perfil", href: "/settings/profile", icon: User },
          { label: "Suporte", href: "/suporte", icon: Headphones },
        ],
        more: [],
      }
    default:
      return {
        fixed: [
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ],
        more: [],
      }
  }
}

interface BottomBarProps {
  role?: Role
}

export function BottomBar({ role }: BottomBarProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const config = getBottomBarConfig(role)
  const hasMore = config.more.length > 0

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  // Check if any "more" item is active
  const moreItemActive = config.more.some((item) => isActive(item.href))

  return (
    <>
      {/* More panel overlay + content */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMoreOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[50vh] rounded-t-2xl bg-background shadow-lg md:hidden"
            >
              {/* Handle + close */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
                <button
                  onClick={() => setMoreOpen(false)}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Grid of items */}
              <div className="grid grid-cols-3 gap-1 overflow-y-auto px-4 pb-6 pt-2">
                {config.more.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="size-6" />
                    {item.label}
                  </Link>
                ))}

                {/* Sair */}
                <button
                  onClick={() => {
                    setMoreOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <LogOut className="size-6" />
                  Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background md:hidden">
        <div className="flex items-center justify-around py-1.5">
          {config.fixed.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}

          {hasMore && (
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                moreOpen || moreItemActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="size-5" />
              Mais
            </button>
          )}
        </div>
        {/* Safe area for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
