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

const INPI_BASE = "https://busca.inpi.gov.br/pePI"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

async function createInpiSession(): Promise<string | null> {
  try {
    const res = await fetch(`${INPI_BASE}/servlet/LoginController?action=login`, {
      headers: { "User-Agent": UA },
      redirect: "manual",
    })
    const cookies = res.headers.getSetCookie?.() ?? []
    const jsessionid = cookies
      .map((c) => c.split(";")[0])
      .find((c) => c.startsWith("JSESSIONID="))
    if (jsessionid) return jsessionid

    const setCookie = res.headers.get("set-cookie") || ""
    const match = setCookie.match(/JSESSIONID=([^;]+)/)
    return match ? `JSESSIONID=${match[1]}` : null
  } catch {
    return null
  }
}

async function fetchWithSession(url: string, cookie: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Cookie: cookie,
        Accept: "text/html,application/xhtml+xml",
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

export async function fetchInpiMarca(numeroProcesso: string): Promise<InpiMarcaResponse | null> {
  const clean = numeroProcesso.replace(/\D/g, "")
  if (clean.length < 7 || clean.length > 12) return null

  try {
    const cookie = await createInpiSession()
    if (!cookie) return null

    const searchUrl = `${INPI_BASE}/servlet/MarcasServletController?Action=searchMarca&tipoPesquisa=BY_NUM_PROC&NumPedido=${clean}`
    const searchHtml = await fetchWithSession(searchUrl, cookie)
    if (!searchHtml) return null

    const codPedido = extractCodPedido(searchHtml)
    if (!codPedido) {
      return parseSearchResults(searchHtml, clean)
    }

    const detailUrl = `${INPI_BASE}/servlet/MarcasServletController?Action=detail&CodPedido=${codPedido}`
    const detailHtml = await fetchWithSession(detailUrl, cookie)
    if (!detailHtml) {
      return parseSearchResults(searchHtml, clean)
    }

    return parseDetailPage(detailHtml, clean)
  } catch {
    return null
  }
}

function extractCodPedido(html: string): string | null {
  const match = html.match(/Action=detail&(?:amp;)?CodPedido=(\d+)/)
  return match ? match[1] : null
}

function parseSearchResults(html: string, numeroProcesso: string): InpiMarcaResponse | null {
  const $ = cheerio.load(html, {})

  if ($("body").text().includes("Nenhum resultado") || $("body").text().includes("0 processos")) {
    return null
  }

  const rows = $("tr[bgColor='#E0E0E0'], tr[bgcolor='#E0E0E0'], tr[bgcolor='#e0e0e0']")
  if (rows.length === 0) return null

  const row = rows.first()
  const cells = row.find("td")

  const marca = cells.eq(3).text().trim() || "—"
  const situacao = cells.eq(5).text().trim() || "—"
  const titular = cells.eq(6).text().trim() || "—"
  const classe = cells.eq(7).text().trim() || "—"

  return {
    numeroProcesso,
    marca,
    situacao,
    titular,
    procurador: "—",
    natureza: "—",
    apresentacao: "—",
    classificacaoNice: classe,
    dataDeposito: cells.eq(1).text().trim() || "—",
    dataConcessao: "—",
    vigencia: "—",
  }
}

function parseDetailPage(html: string, numeroProcesso: string): InpiMarcaResponse | null {
  const $ = cheerio.load(html, {})

  const getFieldValue = (label: string): string => {
    let value = ""
    $("td font.normal").each((_, el) => {
      const text = $(el).text().trim()
      if (text.endsWith(":") && text.replace(":", "").trim().toLowerCase().includes(label.toLowerCase())) {
        const parentTd = $(el).closest("td")
        const nextTd = parentTd.next("td")
        if (nextTd.length) {
          value = nextTd.text().trim()
        }
      }
    })
    return value
  }

  const marca = getFieldValue("Marca")
  const situacao = getFieldValue("Situa")

  if (!marca && !situacao) {
    return null
  }

  // Parse dates from the "Datas" accordion section
  const datesSection = $("#accordion-datas").closest(".accordion-item")
  const dateRow = datesSection.find("tbody tr").first()
  const dateCells = dateRow.find("th font.normal, td font.normal")

  const dataDeposito = dateCells.eq(0).text().trim() || "—"
  const dataConcessao = dateCells.eq(1).text().trim() || "—"
  const vigencia = dateCells.eq(2).text().trim() || "—"

  // Parse titular from "Titulares" accordion section
  const titularesSection = $("#accordion-titulares").closest(".accordion-item")
  const titularCell = titularesSection.find("tbody td").last()
  const titular = titularCell.text().trim() || "—"

  // Parse procurador from "Representante Legal" section
  const procSection = $("#accordion-representantes").closest(".accordion-item")
  const procCell = procSection.find("tbody td").last()
  const procurador = procCell.text().trim() || "—"

  // Parse classificacao from the classification section
  const classSection = $("#accordion-classificacao-produto-servico").closest(".accordion-item")
  const classRows = classSection.find("tbody tr")
  const classes: string[] = []
  classRows.each((_, row) => {
    const cells = $(row).find("td font.normal")
    if (cells.length >= 2) {
      const classeNacional = cells.eq(0).text().trim()
      const subClasse = cells.eq(1).text().trim()
      if (classeNacional) {
        classes.push(subClasse ? `${classeNacional}:${subClasse}` : classeNacional)
      }
    }
  })

  return {
    numeroProcesso,
    marca: marca || "—",
    situacao: situacao || "—",
    titular,
    procurador,
    natureza: getFieldValue("Natureza") || "—",
    apresentacao: getFieldValue("Apresenta") || "—",
    classificacaoNice: classes.length > 0 ? classes.join(", ") : "—",
    dataDeposito,
    dataConcessao,
    vigencia,
  }
}
