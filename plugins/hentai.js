import fetch from "node-fetch"
import cheerio from "cheerio"
import { JSDOM } from "jsdom"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩🔞𓆪 ʜᴇɴᴛᴀɪ ʙᴜsᴄᴀᴅᴏʀ ✦ 」─╮\n│\n╰➺ ✧ *Uso:* ${usedPrefix}hentai <búsqueda>\n╰➺ ✧ *Ejemplo:* ${usedPrefix}hentai Boku ni Harem\n╰➺ ✧ *URL:* ${usedPrefix}hentai <url>\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }

  conn.hentai = conn.hentai || {}
  const isUrl = text.includes('https://veohentai.com/ver/')
  
  if (isUrl) {
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩🕒𓆪 ᴘʀᴏᴄᴇsᴀɴᴅᴏ ✦ 」─╮\n│\n╰➺ ✧ *URL:* ${text}\n╰➺ ✧ *Estado:* Descargando...\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
    
    try {
      const videoInfo = await getInfo(text)
      if (!videoInfo) {
        return conn.sendMessage(m.chat, {
          text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮\n│\n╰➺ ✧ *Error:* No se encontró información del video\n╰➺ ✧ *Verifica la URL*\n\n> LOVELLOUD Official`,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const videoUrl = videoInfo.videoUrl
      let peso = await size(videoInfo.videoUrl)

      const cap = `╭─「 ✦ 𓆩🔞𓆪 ᴠɪᴅᴇᴏ ʜᴇɴᴛᴀɪ ✦ 」─╮\n│\n╰➺ ✧ *Título:* ${videoInfo.title}\n╰➺ ✧ *Vistas:* ${videoInfo.views}\n╰➺ ✧ *Likes:* ${videoInfo.likes}\n╰➺ ✧ *Peso:* ${peso}\n╰➺ ✧ *Dislikes:* ${videoInfo.dislikes}\n╰➺ ✧ *Link:* ${text}\n\n> LOVELLOUD Official`

      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: cap,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      
    } catch (e) {
      console.error('Error en descarga Hentai:', e)
      await conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮\n│\n╰➺ ✧ *Error:* ${e.message}\n╰➺ ✧ *Verifica la URL*\n\n> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    return
  }

 
  await conn.sendMessage(m.chat, {
    text: `╭─「 ✦ 𓆩🔥𓆪 ʙᴜsᴄᴀɴᴅᴏ ✦ 」─╮\n│\n╰➺ ✧ *Búsqueda:* ${text}\n╰➺ ✧ *Estado:* Procesando...\n\n> LOVELLOUD Official`,
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })

  const results = await searchHentai(text)
  if (!results || results.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩❌𓆪 ɴᴏ ʀᴇsᴜʟᴛᴀᴅᴏs ✦ 」─╮\n│\n╰➺ ✧ *Búsqueda:* ${text}\n╰➺ ✧ *Estado:* No se encontraron videos\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }

  const list = results.slice(0, 10).map((res, i) => 
    `*${i + 1}.*\n╰➺ ✧ *Título:* ${res.titulo}\n╰➺ ✧ *Link:* ${res.url}`
  ).join('\n\n')

  const caption = `╭─「 ✦ 𓆩🔞𓆪 ʀᴇsᴜʟᴛᴀᴅᴏs ᴅᴇ ʙᴜsǫᴜᴇᴅᴀ ✦ 」─╮\n│\n╰➺ ✧ *Búsqueda:* ${text}\n╰➺ ✧ *Resultados:* ${results.length}\n│\n${list}\n│\n╰➺ ✧ *Escribe solo el número (1-10) para descargar*\n╰➺ ✧ *Ejemplo: 3, 7, 1*\n╰➺ ✧ *O usa directamente la URL*\n\n> LOVELLOUD Official`

  const { key } = await conn.sendMessage(m.chat, { 
    text: caption,
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  conn.hentai[m.sender] = {
    result: results.slice(0, 10),
    key,
    downloads: 0,
    timeout: setTimeout(() => delete conn.hentai[m.sender], 120_000),
  }
}

handler.before = async (m, { conn }) => {
  conn.hentai = conn.hentai || {}
  const session = conn.hentai[m.sender]
  
  if (!session) return

  
  if (!m.quoted || m.quoted.id !== session.key.id) return

  const n = parseInt(m.text.trim())
  if (isNaN(n) || n < 1 || n > session.result.length) return
  
  
  clearTimeout(session.timeout)
  delete conn.hentai[m.sender]
  
  m.commandExecuted = true
  
  try {
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩🕒𓆪 ᴘʀᴏᴄᴇsᴀɴᴅᴏ ✦ 」─╮\n│\n╰➺ ✧ *Video:* ${n}/${session.result.length}\n╰➺ ✧ *Estado:* Descargando...\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
    
    const link = session.result[n - 1].url
    const videoInfo = await getInfo(link)
    
    if (!videoInfo) {
      throw new Error('No se pudo obtener información del video')
    }

    const videoUrl = videoInfo.videoUrl
    let peso = await size(videoInfo.videoUrl)
    
    const cap = `╭─「 ✦ 𓆩🔞𓆪 ᴠɪᴅᴇᴏ ʜᴇɴᴛᴀɪ ✦ 」─╮\n│\n╰➺ ✧ *Título:* ${videoInfo.title}\n╰➺ ✧ *Vistas:* ${videoInfo.views}\n╰➺ ✧ *Likes:* ${videoInfo.likes}\n╰➺ ✧ *Peso:* ${peso}\n╰➺ ✧ *Dislikes:* ${videoInfo.dislikes}\n╰➺ ✧ *Link:* ${link}\n\n> LOVELLOUD Official`
    
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: cap,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en descarga Hentai:', e)
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮\n│\n╰➺ ✧ *Error:* ${e.message}\n╰➺ ✧ *Inténtalo más tarde*\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  } finally {
    session.downloads++
  }
}

handler.command = ['hentai', 'hent', 'hentaidl', 'htdl', 'hentaisearch', 'hentais']
handler.tags = ['descargas', 'buscador', 'nsfw']
handler.help = ['hentai <búsqueda> - Buscar y descargar videos hentai']

export default handler

async function searchHentai(text) {
  let base = `https://veohentai.com/?s=${encodeURIComponent(text)}`

  try {
    const response = await fetch(base)
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    let resultados = []

    $(".grid a").each((i, el) => {
      let url = $(el).attr("href")
      let titulo = $(el).find("h2").text().trim()

      if (url && titulo) {
        resultados.push({ titulo, url })
      }
    })

    return resultados
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

async function getInfo(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    })

    const data = await response.text()
    const dom = new JSDOM(data)
    const document = dom.window.document

    const iframe = document.querySelector(".aspect-w-16.aspect-h-9 iframe")

    if (iframe) {
      const iframeSrc = iframe.src
      const videoResponse = await fetch(iframeSrc)
      const videoHtml = await videoResponse.text()
      const match = videoHtml.match(/data-id="\/player\.php\?u=([^&]*)/)

      if (!match) throw new Error("No se encontró la URL del video")

      const videoUrl = atob(match[1])

      const title = document.querySelector("h1.text-whitegray.text-lg").textContent.trim()
      const views = document.querySelector("h4.text-whitelite.text-sm").textContent.trim()
      const likes = document.querySelector("#num-like").textContent.trim()
      const dislikes = document.querySelector("#num-dislike").textContent.trim()

      return {
        videoUrl,
        title,
        views,
        likes,
        dislikes
      }
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

async function size(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const size = parseInt(res.headers.get('content-length'), 10)

    if (!size) throw new Error('Size not available')

    if (size >= 1e9) return (size / 1e9).toFixed(2) + ' GB'
    if (size >= 1e6) return (size / 1e6).toFixed(2) + ' MB'
    if (size >= 1e3) return (size / 1e3).toFixed(2) + ' KB'
    return size + ' Bytes'
  } catch (err) {
    return 'Error: ' + err.message
  }
} 