import { NotificationsList } from "@/components/notifications/notifications-list"

export default function NotificacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Acompanhe todas as atualizações dos seus pedidos e do sistema.
        </p>
      </div>
      <NotificationsList />
    </div>
  )
}
