"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCep } from "@/lib/viacep"

interface UserData {
  id: string
  name: string | null
  email: string
  role: string
  cpf: string | null
  cnpj: string | null
  telefone: string | null
  cep: string | null
  endereco: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
}

interface UserFormProps {
  user?: UserData
  availableRoles: string[]
}

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2")
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2")
}

export function UserForm({ user, availableRoles }: UserFormProps) {
  const router = useRouter()
  const isEdit = !!user

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [role, setRole] = useState(user?.role || availableRoles[0] || "LICENCIADO")
  const [cpf, setCpf] = useState(user?.cpf || "")
  const [cnpj, setCnpj] = useState(user?.cnpj || "")
  const [telefone, setTelefone] = useState(user?.telefone || "")
  const [cep, setCep] = useState(user?.cep || "")
  const [endereco, setEndereco] = useState(user?.endereco || "")
  const [numero, setNumero] = useState(user?.numero || "")
  const [bairro, setBairro] = useState(user?.bairro || "")
  const [cidade, setCidade] = useState(user?.cidade || "")
  const [estado, setEstado] = useState(user?.estado || "")
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)

  async function handleCepChange(value: string) {
    const masked = maskCep(value)
    setCep(masked)

    const digits = value.replace(/\D/g, "")
    if (digits.length === 8) {
      setLoadingCep(true)
      try {
        const data = await fetchCep(digits)
        if (data) {
          setEndereco(data.logradouro || "")
          setBairro(data.bairro || "")
          setCidade(data.localidade || "")
          setEstado(data.uf || "")
        }
      } catch {
        // Silently ignore CEP lookup errors
      } finally {
        setLoadingCep(false)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const body: Record<string, string> = {
        name,
        email,
        cpf: cpf.replace(/\D/g, ""),
        cnpj: cnpj.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        cep: cep.replace(/\D/g, ""),
        endereco,
        numero,
        bairro,
        cidade,
        estado,
      }

      if (!isEdit) {
        body.role = role
      }

      const url = isEdit ? `/api/users/${user.id}` : "/api/users"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          isEdit
            ? "Usuário atualizado com sucesso"
            : "Usuário criado com sucesso"
        )
        router.push("/admin/users")
        router.refresh()
      } else {
        toast.error(data.error || "Erro ao salvar usuário")
      }
    } catch {
      toast.error("Erro ao salvar usuário")
    } finally {
      setLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    LICENCIADO: "Licenciado",
    PRESTADOR: "Prestador",
    CLIENTE: "Cliente",
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r] || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(maskCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(maskTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
              />
              {loadingCep && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Nº"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="UF"
              maxLength={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Salvar alterações" : "Criar usuário"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/users")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
