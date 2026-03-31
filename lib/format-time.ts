export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return "agora"
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`
  }

  if (diffHours < 24) {
    return diffHours === 1 ? "há 1 hora" : `há ${diffHours} horas`
  }

  if (diffDays < 7) {
    return diffDays === 1 ? "há 1 dia" : `há ${diffDays} dias`
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
