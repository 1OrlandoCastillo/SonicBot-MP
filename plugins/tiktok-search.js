import fetch from 'node-fetch'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*[❗] Ingresa un término de búsqueda.*\nEjemplo: ${usedPrefix + command} funk`)
  
  try {
    
    const searchUrl = `https://www.bytebazz.store/api/busqueda/tiktok?query=${encodeURIComponent(text)}&apikey=8jkh5icbf05`
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!data.status || !data.resultado || data.resultado.length === 0) {
      return m.reply('*[❗] No se encontraron resultados para tu búsqueda.*')
    }
    
    const video = data.resultado[0]
    

    const info = `
╭───「 ✦ 𝗥𝗘𝗦𝗨𝗟𝗧𝗔𝗗𝗢 𝗗𝗘 𝗧𝗜𝗞𝗧𝗢𝗞 ✦ 」
│
│  *[+] Título:* ${video.titulo || 'Sin título'}
│  *[+] Autor:* ${video.autor || 'Desconocido'}
│  *[+] Región:* ${video.region || 'Desconocida'}
│
│  *[•] Estadísticas*
│  *├─* Vistas: ${video.vistas ? video.vistas.toLocaleString() : 'N/A'}
│  *├─* Me gusta: ${video.me_gusta ? video.me_gusta.toLocaleString() : 'N/A'}
│  *├─* Comentarios: ${video.comentarios ? video.comentarios.toLocaleString() : 'N/A'}
│  *├─* Compartidos: ${video.compartir ? video.compartir.toLocaleString() : 'N/A'}
│  *├─* Descargas: ${video.descargas ? video.descargas.toLocaleString() : 'N/A'}
│  *└─* Fecha: ${video.fecha_creacion ? new Date(video.fecha_creacion * 1000).toLocaleDateString() : 'N/A'}
│
╰───「 ✦ ${global.packname} ✦ 」`
    
    await conn.sendMessage(m.chat, {
      video: { url: video.sin_marca_agua || video.con_marca_agua },
      caption: info,
      mentions: [m.sender]
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en tiktok-search:', e)
    m.reply('*[❗] Ocurrió un error al buscar en TikTok. Por favor, inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#tiktok <búsqueda>']
handler.tags = ['busqueda']
handler.command = /^(tiktok|ttsearch|buscartt|buscartiktok)$/i
export default handler
