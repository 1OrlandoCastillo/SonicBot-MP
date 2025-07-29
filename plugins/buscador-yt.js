import axios from 'axios'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*[❗] Ejemplo de uso:* ${usedPrefix + command} *<búsqueda>*`)
  
  try {

    const searchQuery = encodeURIComponent(text)
    const apiUrl = `https://www.bytebazz.store/api/busqueda/youtube?query=${searchQuery}&apikey=8jkh5icbf05`
    
    const { data } = await axios.get(apiUrl)
    
    if (!data.status || !data.resultado || data.resultado.length === 0) {
      return m.reply('*[❗] No se encontraron resultados para tu búsqueda.*')
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
          title: 'ANYA FORGER',
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
    m.reply('*[❗] Ocurrió un error al realizar la búsqueda. Por favor, inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#yt <búsqueda>']
handler.tags = ['busqueda']
handler.command = /^yt(search|buscar)?$/i

export default handler