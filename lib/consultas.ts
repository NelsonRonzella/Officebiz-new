export interface BrasilApiCnpjResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  data_inicio_atividade: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  cnaes_secundarios: { codigo: number; descricao: string }[]
  natureza_juridica: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  uf: string
  municipio: string
  ddd_telefone_1: string
  ddd_telefone_2: string
  email: string | null
  porte: string
  capital_social: number
  qsa: { nome_socio: string; qualificacao_socio: string; faixa_etaria: string }[]
}

export interface BrasilApiDomainResponse {
  status_code: number
  status: string
  fqdn: string
  fqdns: string[]
  expires_at: string
  suggestions: { fqdn: string; available: boolean }[]
  publication_status: string
}

export async function fetchCnpj(cnpj: string): Promise<BrasilApiCnpjResponse | null> {
  const clean = cnpj.replace(/\D/g, "")
  if (clean.length !== 14) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchDomain(domain: string): Promise<BrasilApiDomainResponse | null> {
  const clean = domain.trim().toLowerCase()
  if (!clean) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(`https://brasilapi.com.br/api/registrobr/v1/${encodeURIComponent(clean)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
