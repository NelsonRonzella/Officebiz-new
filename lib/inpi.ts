import * as cheerio from "cheerio"

export interface InpiMarcaResponse {
  numeroProcesso: string
  marca: string
  situacao: string
  titular: string
  procurador: string
  natureza: string
  apresentacao: string
  classificacaoNice: string
  dataDeposito: string
  dataConcessao: string
  vigencia: string
}

const INPI_BASE_URL = "https://busca.inpi.gov.br/pePI/servlet/MarcasServletController"

export async function fetchInpiMarca(numeroProcesso: string): Promise<InpiMarcaResponse | null> {
  const clean = numeroProcesso.replace(/\D/g, "")
  if (clean.length < 7 || clean.length > 12) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const url = `${INPI_BASE_URL}?Action=searchMarca&tipoPesquisa=BY_NUM_PROC&NumPedido=${clean}`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OfficeBiz/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const html = await res.text()
    return parseInpiHtml(html, clean)
  } catch {
    return null
  }
}

function parseInpiHtml(html: string, numeroProcesso: string): InpiMarcaResponse | null {
  const $ = cheerio.load(html)

  const getText = (label: string): string => {
    let value = ""
    $("td, th").each((_, el) => {
      const text = $(el).text().trim()
      if (text.includes(label)) {
        const next = $(el).next("td")
        if (next.length) {
          value = next.text().trim()
        }
      }
    })
    return value
  }

  const marca = getText("Marca") || getText("Nome")
  const situacao = getText("Situação") || getText("Situacao")

  if (!marca && !situacao) {
    const bodyText = $("body").text()
    if (bodyText.includes("Nenhum resultado") || bodyText.includes("não encontrad")) {
      return null
    }
    if (bodyText.length < 200) return null
  }

  return {
    numeroProcesso,
    marca: marca || "—",
    situacao: situacao || "—",
    titular: getText("Titular") || getText("Requerente") || "—",
    procurador: getText("Procurador") || "—",
    natureza: getText("Natureza") || "—",
    apresentacao: getText("Apresentação") || getText("Apresentacao") || "—",
    classificacaoNice: getText("Classe Nice") || getText("Classificação") || getText("Classificacao") || "—",
    dataDeposito: getText("Depósito") || getText("Deposito") || getText("Data do Depósito") || "—",
    dataConcessao: getText("Concessão") || getText("Concessao") || "—",
    vigencia: getText("Vigência") || getText("Vigencia") || "—",
  }
}
