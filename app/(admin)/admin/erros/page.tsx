import { ErrosPanel } from "@/components/admin/erros-panel"

export default function AdminErrosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Erros do Sistema
        </h1>
        <p className="text-muted-foreground">
          Falhas de IA, envio de WhatsApp, conexão com Evolution e webhooks.
        </p>
      </div>
      <ErrosPanel />
    </div>
  )
}
