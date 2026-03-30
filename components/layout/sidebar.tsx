"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  User,
  CreditCard,
  Headphones,
  LogOut,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Perfil", href: "/settings/profile", icon: User },
  { label: "Assinatura", href: "/settings/billing", icon: CreditCard },
  { label: "Suporte", href: "/suporte", icon: Headphones },
]

function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col" style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white">
          OfficeBiz
        </Link>
      </div>

      {/* Navigation */}
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

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
        <SidebarNav />
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
            <SidebarNav />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-bold tracking-tight text-foreground">
          OfficeBiz
        </span>
      </div>
    </>
  )
}
