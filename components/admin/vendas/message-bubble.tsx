import { cn } from "@/lib/utils"

interface Message {
  id: string
  direction: string
  sender: string
  content: string
  createdAt: string
}

const SENDER_LABEL: Record<string, string> = {
  LEAD: "Lead",
  AI: "🤖 IA",
  ADMIN: "👤 Admin",
}

export function MessageBubble({ message }: { message: Message }) {
  const isIn = message.direction === "IN"
  return (
    <div className={cn("flex", isIn ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
          isIn ? "bg-muted" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="mb-1 text-xs opacity-70">
          {SENDER_LABEL[message.sender] || message.sender} •{" "}
          {new Date(message.createdAt).toLocaleString("pt-BR")}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
