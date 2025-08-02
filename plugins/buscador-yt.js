import axios from 'axios'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: `*[❗] Ejemplo de uso:* ${usedPrefix + command} *<búsqueda>*`,
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  try {

    const searchQuery = encodeURIComponent(text)
    const apiUrl = `https://www.bytebazz.store/api/busqueda/youtube?query=${searchQuery}&apikey=8jkh5icbf05`
    
    const { data } = await axios.get(apiUrl)
    
    if (!data.status || !data.resultado || data.resultado.length === 0) {
      return conn.sendMessage(m.chat, {
        text: '*[❗] No se encontraron resultados para tu búsqueda.*',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    const videos = data.resultado.slice(0, 5)
    
    let message = `*Resultados de: ${text}*\n\n`
    
    videos.forEach((video, index) => {
      message += `*${index + 1}. ${video.title}*\n`
      message += `• *Duración:* ${video.duration.timestamp}\n`
      message += `• *Vistas:* ${video.views.toLocaleString()}\n`
      message += `• *Subido:* ${video.ago}\n`
      message += `• *Canal:* ${video.author.name}\n`
      message += `• *Enlace:* ${video.url}\n\n`
    })
    
    await conn.sendMessage(m.chat, {
      text: message.trim(),
      contextInfo: {
        externalAdReply: {
          title: 'KIYOMI MD',
          body: `Busqueda: ${text}`,
          thumbnailUrl: videos[0].thumbnail,
          sourceUrl: 'https://youtube.com',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
    
  } catch (error) {
    console.error('Error en la búsqueda de YouTube:', error)
    conn.sendMessage(m.chat, {
      text: '*[❗] Ocurrió un error al realizar la búsqueda. Por favor, inténtalo de nuevo más tarde.*',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#yt <búsqueda>']
handler.tags = ['busqueda']
handler.command = /^yt(search|buscar)?$/i

export default handler