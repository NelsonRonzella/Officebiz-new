"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  Phone,
  Globe,
  Mail,
  Bookmark,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadResultado } from "@/lib/leads-buscar"

interface LeadCardProps {
  lead: LeadResultado
  onSalvar: (id: string) => Promise<void>
  onIgnorar: (id: string) => Promise<void>
}

export function LeadCard({ lead, onSalvar, onIgnorar }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ignoring, setIgnoring] = useState(false)

  async function handleSalvar() {
    setSaving(true)
    await onSalvar(lead.id)
    setSaving(false)
  }

  async function handleIgnorar() {
    setIgnoring(true)
    await onIgnorar(lead.id)
    setIgnoring(false)
  }

  const whatsappNumber = lead.telefone?.replace(/\D/g, "")
  const whatsappUrl = whatsappNumber ? `https://wa.me/55${whatsappNumber}` : null

  return (
    <Card
      className={cn(
        "transition-opacity border-l-4",
        lead.jaEncontrado
          ? "opacity-50 border-l-border"
          : lead.salvo
          ? "border-l-primary"
          : "border-l-success",
        lead.ignorado && "hidden"
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{lead.nome}</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{lead.endereco}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {lead.avaliacao && (
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="size-3 fill-amber-500" />
                {lead.avaliacao.toFixed(1)}
              </span>
            )}
            {lead.jaEncontrado ? (
              <Badge variant="secondary" className="text-xs">Já encontrado</Badge>
            ) : lead.salvo ? (
              <Badge className="text-xs bg-primary/20 text-primary">Salvo</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-success border-success">Novo</Badge>
            )}
          </div>
        </div>

        {/* Contact chips */}
        <div className="flex flex-wrap gap-1.5">
          {lead.telefone && (
            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
              <Phone className="size-3" />
              {lead.telefone}
            </span>
          )}
          {lead.email && (
            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-primary">
              <Mail className="size-3" />
              Email
            </span>
          )}
          {lead.instagram && (
            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-purple-500">
              <AtSign className="size-3" />
              Instagram
            </span>
          )}
          {lead.site && (
            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
              <Globe className="size-3" />
              Site
            </span>
          )}
        </div>

        {/* Expand/collapse */}
        {!lead.jaEncontrado && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {expanded ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
        )}

        {/* Expanded details */}
        {expanded && !lead.jaEncontrado && (
          <div className="border-t pt-3 flex flex-col gap-2.5 text-sm">
            {lead.telefone && whatsappUrl && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Telefone</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{lead.telefone}</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="size-3" />
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">E-mail</span>
                <span className="text-xs text-primary">{lead.email}</span>
              </div>
            )}
            {lead.instagram && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Instagram</span>
                <span className="text-xs text-purple-500">{lead.instagram}</span>
              </div>
            )}
            {lead.site && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Site</span>
                <a
                  href={lead.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate max-w-[200px]"
                >
                  {lead.site.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {lead.cnpj && (
              <div className="border-t pt-2 flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Receita Federal</span>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">CNPJ</span>
                  <span className="text-xs font-mono">{lead.cnpj}</span>
                </div>
                {lead.razaoSocial && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Razão Social</span>
                    <span className="text-xs truncate max-w-[200px]">{lead.razaoSocial}</span>
                  </div>
                )}
                {lead.socios.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">Sócios</span>
                    {lead.socios.map((s, i) => (
                      <span key={i} className="text-xs pl-2">• {s}</span>
                    ))}
                  </div>
                )}
                {lead.cnae && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">CNAE</span>
                    <span className="text-xs truncate max-w-[200px]">{lead.cnae}</span>
                  </div>
                )}
                {lead.situacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Situação</span>
                    <Badge
                      variant={lead.situacao.includes("ATIVA") ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {lead.situacao}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={handleSalvar}
                disabled={saving || lead.salvo}
              >
                <Bookmark className="size-3 mr-1" />
                {lead.salvo ? "Salvo" : saving ? "Salvando..." : "Salvar Lead"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={handleIgnorar}
                disabled={ignoring}
              >
                <EyeOff className="size-3 mr-1" />
                {ignoring ? "..." : "Ignorar"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
