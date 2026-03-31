"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, Info, CheckCircle, AlertTriangle, Package, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format-time"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ORDER_UPDATE" | "SYSTEM"
  read: boolean
  link: string | null
  createdAt: string
}

const typeConfig = {
  INFO: { icon: Info, dotClass: "bg-blue-500" },
  SUCCESS: { icon: CheckCircle, dotClass: "bg-green-500" },
  WARNING: { icon: AlertTriangle, dotClass: "bg-amber-500" },
  ORDER_UPDATE: { icon: Package, dotClass: "bg-violet-500" },
  SYSTEM: { icon: Settings, dotClass: "bg-gray-500" },
} as const

interface NotificationBellProps {
  notificationsHref?: string
}

export function NotificationBell({ notificationsHref = "/app/notificacoes" }: NotificationBellProps) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // Silently fail polling
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications?limit=10")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  // Fetch notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId }),
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Silently fail
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // Silently fail
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }
    if (notification.link) {
      setOpen(false)
      router.push(notification.link)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative" />
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notificações</span>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                Carregando...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="size-8 text-muted-foreground/50 mb-2" />
              <span className="text-sm text-muted-foreground">
                Nenhuma notificação
              </span>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const config = typeConfig[notification.type]
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !notification.read && "bg-muted/30"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        notification.read
                          ? "bg-transparent"
                          : config.dotClass
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.read
                            ? "font-semibold"
                            : "font-normal text-muted-foreground"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2">
          <button
            onClick={() => {
              setOpen(false)
              router.push(notificationsHref)
            }}
            className="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors py-1"
          >
            Ver todas
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
