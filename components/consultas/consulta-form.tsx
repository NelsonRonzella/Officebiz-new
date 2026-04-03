"use client"

import { useState, type ReactNode, type FormEvent } from "react"
import type { LucideIcon } from "lucide-react"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ConsultaFormProps<T> {
  title: string
  description: string
  icon: LucideIcon
  inputLabel: string
  inputPlaceholder: string
  inputMask?: (value: string) => string
  maxLength?: number
  apiEndpoint: string
  renderResult: (data: T) => ReactNode
  validateInput?: (value: string) => string | null
}

export function ConsultaForm<T>({
  title,
  description,
  icon: Icon,
  inputLabel,
  inputPlaceholder,
  inputMask,
  maxLength,
  apiEndpoint,
  renderResult,
  validateInput,
}: ConsultaFormProps<T>) {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleInputChange(value: string) {
    setQuery(inputMask ? inputMask(value) : value)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setData(null)

    if (validateInput) {
      const validationError = validateInput(query)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsLoading(true)
    try {
      const cleanQuery = query.replace(/[.\-\/]/g, "").trim()
      const res = await fetch(`${apiEndpoint}?q=${encodeURIComponent(cleanQuery)}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erro ao realizar consulta")
        return
      }

      setData(json as T)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="consulta-input">{inputLabel}</Label>
              <Input
                id="consulta-input"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                maxLength={maxLength}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Consultar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardContent className="py-6">{renderResult(data)}</CardContent>
        </Card>
      )}
    </div>
  )
}
