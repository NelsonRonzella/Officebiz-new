"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wifi, WifiOff } from "lucide-react"

interface ServiceStatus {
  name: string
  connected: boolean | null
}

export function ConnectionStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "WhatsApp", connected: null },
    { name: "INPI Relay", connected: null },
  ])

  const checkServices = useCallback(async () => {
    const [whatsapp, inpi] = await Promise.all([
      fetch("/api/whatsapp/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.connected ?? false)
        .catch(() => false),
      fetch("/api/inpi/status")
        .then((r) => r.ok)
        .catch(() => false),
    ])

    setServices([
      { name: "WhatsApp", connected: whatsapp },
      { name: "INPI Relay", connected: inpi },
    ])
  }, [])

  useEffect(() => {
    checkServices()
    const interval = setInterval(checkServices, 30_000)
    return () => clearInterval(interval)
  }, [checkServices])

  return (
    <div className="flex items-center gap-2">
      {services.map((svc) => (
        <Badge
          key={svc.name}
          variant="outline"
          className={`gap-1.5 text-xs ${
            svc.connected === null
              ? "border-muted-foreground/30 text-muted-foreground"
              : svc.connected
                ? "border-green-500/30 text-green-600 dark:text-green-400"
                : "border-destructive/30 text-destructive"
          }`}
        >
          {svc.connected === null ? (
            <Loader2 className="size-3 animate-spin" />
          ) : svc.connected ? (
            <Wifi className="size-3" />
          ) : (
            <WifiOff className="size-3" />
          )}
          {svc.name}
        </Badge>
      ))}
    </div>
  )
}
