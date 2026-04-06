/**
 * Normalize a WhatsApp phone string to E.164 digits only.
 * Examples:
 *   "+5517999998888"            -> "5517999998888"
 *   "5517999998888@s.whatsapp.net" -> "5517999998888"
 *   "(17) 99999-8888" (BR)      -> "5517999998888" (assumes BR if 10 or 11 digits)
 */
export function normalizePhone(raw: string): string {
  if (!raw) return ""
  const base = raw.split("@")[0]
  const digits = base.replace(/\D/g, "")
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  return digits
}
