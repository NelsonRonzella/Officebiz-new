"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleBadge } from "@/components/admin/role-badge"
import type { Role } from "@prisma/client"

interface User {
  id: string
  name: string | null
  email: string
  role: Role
  active: boolean
  emailVerified: string | null
  telefone: string | null
  createdAt: string
}

interface UsersTableProps {
  initialUsers: User[]
  initialTotal: number
}

const ROLES_TABS = [
  { label: "Todos", value: "" },
  { label: "Admins", value: "ADMIN" },
  { label: "Licenciados", value: "LICENCIADO" },
  { label: "Prestadores", value: "PRESTADOR" },
  { label: "Clientes", value: "CLIENTE" },
]

export function UsersTable({ initialUsers, initialTotal }: UsersTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const limit = 10

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (roleFilter) params.set("role", roleFilter)

      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
        setTotal(data.total)
      } else {
        toast.error(data.error || "Erro ao buscar usuários")
      }
    } catch {
      toast.error("Erro ao buscar usuários")
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  async function handleToggle(userId: string) {
    setTogglingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}/toggle`, {
        method: "PATCH",
      })
      const data = await res.json()

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active: data.active } : u))
        )
        toast.success(
          data.active ? "Usuário ativado" : "Usuário desativado"
        )
      } else {
        toast.error(data.error || "Erro ao alterar status")
      }
    } catch {
      toast.error("Erro ao alterar status")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleResendInvite(userId: string) {
    setInvitingId(userId)
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success("Convite reenviado com sucesso")
      } else {
        toast.error(data.error || "Erro ao reenviar convite")
      }
    } catch {
      toast.error("Erro ao reenviar convite")
    } finally {
      setInvitingId(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          defaultValue=""
          onValueChange={(val) => {
            setRoleFilter(val as string)
            setPage(1)
          }}
        >
          <TabsList>
            {ROLES_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Perfil
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Ativo
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Criado em
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {user.name || "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(user.id)
                      }}
                      disabled={togglingId === user.id}
                      className="inline-flex items-center"
                      aria-label={user.active ? "Desativar" : "Ativar"}
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          user.active ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                            user.active ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!user.emailVerified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResendInvite(user.id)
                        }}
                        disabled={invitingId === user.id}
                      >
                        {invitingId === user.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Mail className="size-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">
                          Reenviar convite
                        </span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} usuário{total !== 1 ? "s" : ""} encontrado
            {total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
