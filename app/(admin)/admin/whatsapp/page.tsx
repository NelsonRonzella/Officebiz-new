import { WhatsAppPanel } from "@/components/admin/whatsapp-panel"

export default function AdminWhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Status da conexão, QR Code e teste de envio de mensagens.
        </p>
      </div>
      <WhatsAppPanel />
    </div>
  )
}
