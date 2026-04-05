"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { fetchCep } from "@/lib/viacep"
import { maskPhone } from "@/lib/masks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Upload, X } from "lucide-react"

interface ProfileFormData {
  name: string
  phone: string
  companyName: string
  companyLogo: string
  companyFavicon: string
  brandPrimaryColor: string
  brandAccentColor: string
  cpf: string
  cnpj: string
  telefone: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}

interface ProfileFormProps {
  initialData: ProfileFormData
  role: string
}

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6)
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5)
    return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function ProfileForm({ initialData, role }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState(initialData.name)
  const [phone, setPhone] = useState(maskPhone(initialData.phone))
  const [companyName, setCompanyName] = useState(initialData.companyName)
  const [companyLogo, setCompanyLogo] = useState(initialData.companyLogo)
  const [companyFavicon, setCompanyFavicon] = useState(initialData.companyFavicon)
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(initialData.brandPrimaryColor)
  const [brandAccentColor, setBrandAccentColor] = useState(initialData.brandAccentColor)
  const [cpf, setCpf] = useState(initialData.cpf ? maskCpf(initialData.cpf) : "")
  const [cnpj, setCnpj] = useState(initialData.cnpj ? maskCnpj(initialData.cnpj) : "")
  const [telefone, setTelefone] = useState(initialData.telefone ? maskPhone(initialData.telefone) : "")
  const [cep, setCep] = useState(initialData.cep ? maskCep(initialData.cep) : "")
  const [endereco, setEndereco] = useState(initialData.endereco)
  const [numero, setNumero] = useState(initialData.numero)
  const [bairro, setBairro] = useState(initialData.bairro)
  const [cidade, setCidade] = useState(initialData.cidade)
  const [estado, setEstado] = useState(initialData.estado)

  const isLicenciado = role === "LICENCIADO"

  async function handleImageUpload(
    file: File,
    setter: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 2MB.")
      return
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/x-icon"].includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WebP, SVG ou ICO.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Erro ao fazer upload")
      }
      const data = await res.json()
      setter(data.url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  async function handleCepChange(value: string) {
    const masked = maskCep(value)
    setCep(masked)

    const digits = value.replace(/\D/g, "")
    if (digits.length === 8) {
      setIsFetchingCep(true)
      const result = await fetchCep(digits)
      setIsFetchingCep(false)

      if (result) {
        setEndereco(result.logradouro)
        setBairro(result.bairro)
        setCidade(result.localidade)
        setEstado(result.uf)
      } else {
        toast.error("CEP não encontrado.")
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fieldErrors: Record<string, string> = {}
    if (!name || name.length < 2) {
      fieldErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }
    if (!companyName || companyName.length < 2) {
      fieldErrors.companyName = "Nome da empresa deve ter pelo menos 2 caracteres"
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName,
          companyLogo: companyLogo || undefined,
          companyFavicon: companyFavicon || undefined,
          brandPrimaryColor: brandPrimaryColor || "",
          brandAccentColor: brandAccentColor || "",
          cpf: cpf ? cpf.replace(/\D/g, "") : undefined,
          cnpj: cnpj ? cnpj.replace(/\D/g, "") : undefined,
          telefone: telefone ? telefone.replace(/\D/g, "") : undefined,
          cep: cep ? cep.replace(/\D/g, "") : undefined,
          endereco: endereco || undefined,
          numero: numero || undefined,
          bairro: bairro || undefined,
          cidade: cidade || undefined,
          estado: estado || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar")
      }

      toast.success("Perfil atualizado com sucesso!")
      router.refresh()
    } catch {
      toast.error("Ocorreu um erro ao salvar o perfil.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              placeholder="Sua empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branding — only for LICENCIADO */}
      {isLicenciado && (
        <Card>
          <CardHeader>
            <CardTitle>Marca</CardTitle>
            <CardDescription>
              Personalize a aparência da plataforma para seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo da empresa</Label>
              {companyLogo ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded-lg border">
                    <img
                      src={companyLogo}
                      alt="Logo"
                      className="size-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompanyLogo("")}
                  >
                    <X className="mr-1 size-4" />
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50">
                  {uploadingLogo ? (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="size-6 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingLogo ? "Enviando..." : "Clique para enviar (JPG, PNG, WebP, SVG — máx 2MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, setCompanyLogo, setUploadingLogo)
                    }}
                  />
                </label>
              )}
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <Label>Favicon</Label>
              <p className="text-xs text-muted-foreground">
                Ícone que aparece na aba do navegador. Recomendado: 32x32 ou 64x64 pixels.
              </p>
              {companyFavicon ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded border">
                    <img
                      src={companyFavicon}
                      alt="Favicon"
                      className="size-full object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCompanyFavicon("")}
                  >
                    <X className="mr-1 size-4" />
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                  {uploadingFavicon ? (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="size-5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {uploadingFavicon ? "Enviando..." : "PNG, ICO ou SVG — máx 2MB"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    className="hidden"
                    disabled={uploadingFavicon}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, setCompanyFavicon, setUploadingFavicon)
                    }}
                  />
                </label>
              )}
            </div>

            {/* Colors */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandPrimaryColor">Cor primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="brandPrimaryColor"
                    value={brandPrimaryColor || "#1E3A5F"}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="size-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    placeholder="#1E3A5F"
                    className="font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandAccentColor">Cor de destaque</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="brandAccentColor"
                    value={brandAccentColor || "#6366f1"}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    className="size-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    placeholder="#6366f1"
                    className="font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {(brandPrimaryColor || brandAccentColor) && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Preview</p>
                <div className="flex items-center gap-3">
                  {companyLogo && (
                    <img src={companyLogo} alt="Logo" className="size-8 object-contain" />
                  )}
                  <span
                    className="text-lg font-bold"
                    style={{ color: brandPrimaryColor || "#1E3A5F" }}
                  >
                    {companyName || "Sua Empresa"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="rounded px-3 py-1.5 text-sm font-medium text-white"
                    style={{ backgroundColor: brandPrimaryColor || "#1E3A5F" }}
                  >
                    Botão primário
                  </div>
                  <div
                    className="rounded px-3 py-1.5 text-sm font-medium text-white"
                    style={{ backgroundColor: brandAccentColor || "#6366f1" }}
                  >
                    Botão destaque
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(maskCnpj(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                />
                {isFetchingCep && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Rua, Avenida..."
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                placeholder="UF"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isSubmitting ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  )
}
