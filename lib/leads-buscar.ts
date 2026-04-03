import { db } from "@/lib/db"
import { searchPlaces } from "@/lib/google-places"
import { enrichLead } from "@/lib/openrouter"
import { fetchCnpj } from "@/lib/consultas"

export interface LeadResultado {
  id: string
  placeId: string
  nome: string
  nomeFantasia: string | null
  endereco: string
  cidade: string
  estado: string
  telefone: string | null
  site: string | null
  avaliacao: number | null
  avaliacoes: number | null
  email: string | null
  instagram: string | null
  whatsapp: string | null
  cnpj: string | null
  razaoSocial: string | null
  socios: string[]
  cnae: string | null
  situacao: string | null
  segmento: string
  raioKm: number
  ignorado: boolean
  salvo: boolean
  buscadoEm: Date
  jaEncontrado: boolean
}

async function tryExtractCnpjFromSite(siteUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)
    const res = await fetch(siteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/\d{2}[\.\s]?\d{3}[\.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}/)
    if (!match) return null
    const cnpj = match[0].replace(/\D/g, "")
    return cnpj.length === 14 ? cnpj : null
  } catch {
    return null
  }
}

export async function buscarLeads(
  userId: string,
  segmento: string,
  cidade: string,
  estado: string,
  raioKm: number
): Promise<LeadResultado[]> {
  const places = await searchPlaces(segmento, cidade, estado)
  if (!places || places.length === 0) return []

  const results: LeadResultado[] = []

  for (const place of places) {
    const placeId = place.id
    const nome = place.displayName.text

    const existing = await db.leadBuscado.findUnique({
      where: { placeId_userId: { placeId, userId } },
    })

    if (existing) {
      results.push({ ...existing, jaEncontrado: true })
      continue
    }

    // AI enrichment
    const enrichment = await enrichLead(nome, cidade, estado, place.websiteUri)

    // CNPJ best-effort via website scraping
    let cnpj: string | null = null
    let razaoSocial: string | null = null
    let socios: string[] = []
    let cnae: string | null = null
    let situacao: string | null = null
    let nomeFantasia: string | null = null

    if (place.websiteUri) {
      const extractedCnpj = await tryExtractCnpjFromSite(place.websiteUri)
      if (extractedCnpj) {
        const cnpjData = await fetchCnpj(extractedCnpj)
        if (cnpjData) {
          cnpj = cnpjData.cnpj
          razaoSocial = cnpjData.razao_social
          nomeFantasia = cnpjData.nome_fantasia || null
          socios = cnpjData.qsa?.map((s) => s.nome_socio) ?? []
          cnae = cnpjData.cnae_fiscal
            ? `${cnpjData.cnae_fiscal} - ${cnpjData.cnae_fiscal_descricao}`
            : null
          situacao = cnpjData.descricao_situacao_cadastral ?? null
        }
      }
    }

    const lead = await db.leadBuscado.create({
      data: {
        placeId,
        nome,
        nomeFantasia,
        endereco: place.formattedAddress,
        cidade,
        estado,
        telefone: place.nationalPhoneNumber ?? null,
        site: place.websiteUri ?? null,
        avaliacao: place.rating ?? null,
        avaliacoes: place.userRatingCount ?? null,
        email: enrichment?.email ?? null,
        instagram: enrichment?.instagram ?? null,
        whatsapp: null,
        cnpj,
        razaoSocial,
        socios,
        cnae,
        situacao,
        segmento,
        raioKm,
        userId,
      },
    })

    results.push({ ...lead, jaEncontrado: false })
  }

  // novos primeiro, já encontrados por último
  return results.sort((a, b) => Number(a.jaEncontrado) - Number(b.jaEncontrado))
}
