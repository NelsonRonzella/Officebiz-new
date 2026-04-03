export interface EnrichmentResult {
  instagram: string | null
  email: string | null
}

export async function enrichLead(
  nome: string,
  cidade: string,
  estado: string,
  site?: string | null
): Promise<EnrichmentResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  const prompt = `Você é um pesquisador de contatos empresariais.
Empresa: "${nome}", cidade: "${cidade}/${estado}", site: "${site ?? "não informado"}".
Encontre o Instagram e email público desta empresa.
Responda APENAS em JSON válido: {"instagram": "@handle_ou_null", "email": "email_ou_null"}
Se não encontrar, retorne null para o campo. Nunca invente dados.`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://officebiz.com.br",
        "X-Title": "OfficeBiz Buscador de Leads",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    const content: string | undefined = data.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content) as Record<string, unknown>
    return {
      instagram: typeof parsed.instagram === "string" ? parsed.instagram : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
    }
  } catch {
    return null
  }
}
