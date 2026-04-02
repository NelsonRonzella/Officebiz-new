/**
 * INPI Relay Server
 *
 * Roda no seu PC e faz consultas ao INPI com IP residencial.
 * A Vercel chama este servidor via Cloudflare Tunnel.
 *
 * Uso:
 *   node relay/inpi-server.mjs
 *
 * Depois configure o Cloudflare Tunnel para apontar para http://localhost:3939
 */

import http from "node:http"
import * as cheerio from "cheerio"

const PORT = process.env.RELAY_PORT || 3939
const SECRET = process.env.RELAY_SECRET || "officebiz-inpi-relay-2024"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const INPI_BASE = "https://busca.inpi.gov.br/pePI"

// --- INPI Session & Scraping ---

async function createSession() {
  const res = await fetch(`${INPI_BASE}/servlet/LoginController?action=login`, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  })
  const cookies = res.headers.getSetCookie?.() ?? []
  // Must send ALL cookies (JSESSIONID + BUSCAID) for session to work
  const allCookies = cookies.map((c) => c.split(";")[0]).join("; ")
  return allCookies || null
}

async function fetchWithSession(url, cookie) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { "User-Agent": UA, Cookie: cookie, Accept: "text/html" },
  })
  clearTimeout(timeout)
  if (!res.ok) return null
  return res.text()
}

function extractCodPedido(html) {
  const match = html.match(/Action=detail&(?:amp;)?CodPedido=(\d+)/)
  return match ? match[1] : null
}

function parseDetailPage(html, numeroProcesso) {
  const $ = cheerio.load(html)

  const getFieldValue = (label) => {
    let value = ""
    $("td font.normal").each((_, el) => {
      const text = $(el).text().trim()
      if (text.endsWith(":") && text.replace(":", "").trim().toLowerCase().includes(label.toLowerCase())) {
        const nextTd = $(el).closest("td").next("td")
        if (nextTd.length) value = nextTd.text().trim()
      }
    })
    return value
  }

  const marca = getFieldValue("Marca")
  const situacao = getFieldValue("Situa")
  if (!marca && !situacao) return null

  // Extract dates section via regex (cheerio struggles with the tooltip markup)
  const datesMatch = html.match(/accordion-datas[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/)
  const dateValues = datesMatch ? datesMatch[1].match(/\d{2}\/\d{2}\/\d{4}/g) || [] : []

  const titularesSection = $("#accordion-titulares").closest(".accordion-item")
  const titular = titularesSection.find("tbody td").last().text().trim() || "—"

  const procSection = $("#accordion-representantes").closest(".accordion-item")
  const procurador = procSection.find("tbody td").last().text().trim() || "—"

  const classSection = $("#accordion-classificacao-produto-servico").closest(".accordion-item")
  const classes = new Set()
  classSection.find("tbody td font.normal").each((_, el) => {
    const text = $(el).text().trim()
    if (/^\d{1,3}$/.test(text)) classes.add(text)
  })

  return {
    numeroProcesso,
    marca: marca || "—",
    situacao: situacao || "—",
    titular,
    procurador,
    natureza: getFieldValue("Natureza") || "—",
    apresentacao: getFieldValue("Apresenta") || "—",
    classificacaoNice: classes.size > 0 ? [...classes].join(", ") : "—",
    dataDeposito: dateValues[0] || "—",
    dataConcessao: dateValues[1] || "—",
    vigencia: dateValues[2] || "—",
  }
}

async function consultarInpi(numeroProcesso) {
  const clean = numeroProcesso.replace(/\D/g, "")
  if (clean.length < 7 || clean.length > 12) return { error: "Número inválido", status: 400 }

  const cookie = await createSession()
  if (!cookie) return { error: "Falha ao criar sessão INPI", status: 502 }

  const searchHtml = await fetchWithSession(
    `${INPI_BASE}/servlet/MarcasServletController?Action=searchMarca&tipoPesquisa=BY_NUM_PROC&NumPedido=${clean}`,
    cookie,
  )
  if (!searchHtml) return { error: "Falha na busca INPI", status: 502 }

  const codPedido = extractCodPedido(searchHtml)
  if (!codPedido) return { error: "Processo não encontrado", status: 404 }

  const detailHtml = await fetchWithSession(
    `${INPI_BASE}/servlet/MarcasServletController?Action=detail&CodPedido=${codPedido}`,
    cookie,
  )
  if (!detailHtml) return { error: "Falha ao carregar detalhes", status: 502 }

  const data = parseDetailPage(detailHtml, clean)
  if (!data) return { error: "Processo não encontrado", status: 404 }

  return { data, status: 200 }
}

async function consultarInpiPorNome(nome) {
  const cookie = await createSession()
  if (!cookie) return { error: "Falha ao criar sessão INPI", status: 502 }

  try {
    const params = new URLSearchParams({
      Action: "searchMarca",
      tipoPesquisa: "BY_MARCA_CLASSIF_BASICA",
      marca: nome,
      classeInter: "",
      buscaExata: "sim",
      txt: "",
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    const res = await fetch(`${INPI_BASE}/servlet/MarcasServletController`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Cookie: cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const html = await res.text()
    if (!html || html.length < 100) return { error: "Falha na busca INPI", status: 502 }

    const $ = cheerio.load(html)
    const countMatch = html.match(/encontrados <b>(\d+)<\/b>/)
    const total = countMatch ? parseInt(countMatch[1]) : 0

    const resultados = []
    $('tr[bgColor="#E0E0E0"]').each((_, row) => {
      const cells = $(row).find("td")
      const numero = cells.eq(0).text().trim()
      const marca = cells.eq(3).text().trim()
      const situacao = cells.eq(5).text().trim()
      const titular = cells.eq(6).text().trim()
      const classe = cells.eq(7).text().trim()

      if (marca) {
        resultados.push({
          numero: numero !== "-" ? numero : "",
          marca,
          situacao,
          titular,
          classe,
        })
      }
    })

    const disponivel = total === 0

    return {
      data: {
        consulta: nome,
        total,
        disponivel,
        mensagem: disponivel
          ? `Nenhuma marca "${nome}" encontrada. O nome pode estar disponível para registro.`
          : `Encontradas ${total} marcas com o nome "${nome}".`,
        resultados: resultados.slice(0, 20),
      },
      status: 200,
    }
  } catch (err) {
    console.error("INPI nome erro:", err.message)
    return { error: "Falha ao consultar INPI", status: 502 }
  }
}

// --- HTTP Server ---

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json")

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  // Auth
  const authHeader = req.headers["x-relay-secret"]
  if (authHeader !== SECRET) {
    res.writeHead(401)
    res.end(JSON.stringify({ error: "Unauthorized" }))
    return
  }

  // Route
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (url.pathname === "/health") {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }))
    return
  }

  // --- CNPJ proxy (Brasil API) ---
  if (url.pathname === "/cnpj" && req.method === "GET") {
    const q = url.searchParams.get("q")
    if (!q) { res.writeHead(400); res.end(JSON.stringify({ error: "Parâmetro 'q' obrigatório" })); return }
    try {
      const clean = q.replace(/\D/g, "")
      const apiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      })
      const data = await apiRes.json()
      res.writeHead(apiRes.status)
      res.end(JSON.stringify(data))
    } catch (err) {
      console.error("CNPJ erro:", err.message)
      res.writeHead(502)
      res.end(JSON.stringify({ error: "Erro ao consultar CNPJ" }))
    }
    return
  }

  // --- Domínio proxy (Brasil API) ---
  if (url.pathname === "/dominio" && req.method === "GET") {
    const q = url.searchParams.get("q")
    if (!q) { res.writeHead(400); res.end(JSON.stringify({ error: "Parâmetro 'q' obrigatório" })); return }
    try {
      const apiRes = await fetch(`https://brasilapi.com.br/api/registrobr/v1/${encodeURIComponent(q.trim())}`, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      })
      const data = await apiRes.json()
      res.writeHead(apiRes.status)
      res.end(JSON.stringify(data))
    } catch (err) {
      console.error("Domínio erro:", err.message)
      res.writeHead(502)
      res.end(JSON.stringify({ error: "Erro ao consultar domínio" }))
    }
    return
  }

  // --- INPI search by brand name ---
  if (url.pathname === "/inpi/marca" && req.method === "GET") {
    const q = url.searchParams.get("q")
    if (!q || q.trim().length < 2) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: "Nome da marca deve ter pelo menos 2 caracteres" }))
      return
    }

    try {
      const result = await consultarInpiPorNome(q.trim())
      res.writeHead(result.status)
      res.end(JSON.stringify(result.data || { error: result.error }))
    } catch (err) {
      console.error("INPI marca erro:", err.message)
      res.writeHead(500)
      res.end(JSON.stringify({ error: "Erro interno do relay" }))
    }
    return
  }

  // --- INPI search by process number ---
  if (url.pathname === "/inpi" && req.method === "GET") {
    const q = url.searchParams.get("q")
    if (!q) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: "Parâmetro 'q' obrigatório" }))
      return
    }

    try {
      const result = await consultarInpi(q)
      res.writeHead(result.status)
      res.end(JSON.stringify(result.data || { error: result.error }))
    } catch (err) {
      console.error("Erro:", err.message)
      res.writeHead(500)
      res.end(JSON.stringify({ error: "Erro interno do relay" }))
    }
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: "Not found" }))
})

server.listen(PORT, () => {
  console.log(`\n🟢 INPI Relay Server rodando em http://localhost:${PORT}`)
  console.log(`   Secret: ${SECRET}`)
  console.log(`\n   Próximo passo: configure o Cloudflare Tunnel para apontar para http://localhost:${PORT}`)
  console.log(`   Depois defina INPI_RELAY_URL e INPI_RELAY_SECRET na Vercel.\n`)
})
