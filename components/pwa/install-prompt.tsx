"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already running as PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone)
    setIsStandalone(!!standalone)

    // Check if dismissed recently (24h)
    const dismissedAt = localStorage.getItem("pwa-dismiss")
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      setDismissed(true)
    }

    // iOS detection (Safari doesn't fire beforeinstallprompt)
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)
    setIsIos(ios)

    // Android/Chrome install prompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem("pwa-dismiss", String(Date.now()))
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  // Don't show if already installed, dismissed, or no prompt available (and not iOS)
  if (isStandalone || dismissed) return null
  if (!deferredPrompt && !isIos) return null

  return (
    <div className="w-full max-w-md mx-auto mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <Download className="size-5 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Instale o OfficeBiz
          </p>
          <p className="text-xs text-muted-foreground">
            {isIos
              ? "Toque em Compartilhar e depois \"Adicionar à Tela de Início\""
              : "Acesse mais rápido direto do seu celular"}
          </p>
        </div>
        {!isIos ? (
          <Button size="sm" onClick={handleInstall} className="shrink-0">
            Instalar
          </Button>
        ) : null}
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
