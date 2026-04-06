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

/**
 * Verifica se um JID é do tipo LID (Local ID — sistema de privacidade do WhatsApp).
 */
export function isLidJid(jid: string): boolean {
  return typeof jid === "string" && jid.endsWith("@lid")
}

/**
 * Tenta resolver um JID @lid para o telefone real (formato @s.whatsapp.net),
 * fazendo lookup na tabela de contatos da Evolution API.
 *
 * Estratégia:
 * 1. Busca o contato pelo remoteJid LID e captura pushName + profilePicUrl
 * 2. Lista todos os contatos e procura outro com @s.whatsapp.net que tenha
 *    o MESMO profilePicUrl (match forte). Se não houver profilePicUrl,
 *    cai pro match por pushName (mais frágil).
 *
 * Retorna o telefone normalizado (ex: "5517997014926") ou null se não encontrar.
 */
export async function resolveLidToPhone(lidJid: string): Promise<string | null> {
  if (!isLidJid(lidJid)) return null

  const url = process.env.EVOLUTION_API_URL?.trim()
  const key = process.env.EVOLUTION_API_KEY?.trim()
  const instance = process.env.EVOLUTION_API_INSTANCE?.trim() || "officebiz"
  if (!url || !key) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)
    const res = await fetch(`${url}/chat/findContacts/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ where: {} }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null

    const contacts = (await res.json()) as Array<{
      remoteJid: string
      pushName?: string | null
      profilePicUrl?: string | null
    }>
    if (!Array.isArray(contacts)) return null

    const lidContact = contacts.find((c) => c.remoteJid === lidJid)
    if (!lidContact) return null

    const realContacts = contacts.filter(
      (c) => c.remoteJid?.endsWith("@s.whatsapp.net") && c.remoteJid !== "0@s.whatsapp.net"
    )

    // 1) Match forte: profilePicUrl idêntico
    if (lidContact.profilePicUrl) {
      const byPic = realContacts.find(
        (c) => c.profilePicUrl && c.profilePicUrl === lidContact.profilePicUrl
      )
      if (byPic) return normalizePhone(byPic.remoteJid)
    }

    // 2) Fallback: mesmo pushName (apenas se for único entre os reais)
    if (lidContact.pushName) {
      const byName = realContacts.filter((c) => c.pushName === lidContact.pushName)
      if (byName.length === 1) return normalizePhone(byName[0].remoteJid)
    }

    return null
  } catch {
    return null
  }
}
