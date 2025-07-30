import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*[❗] Debes ingresar un texto para consultar a Gemini.*\n*Ejemplo:* ${usedPrefix + command} ¿Quién eres?`)
  
  try {
    
    const searchQuery = encodeURIComponent(text)
    const apiUrl = `https://www.bytebazz.store/api/ai/gemini?texto=${searchQuery}&apikey=8jkh5icbf05`
    
    const { data } = await axios.get(apiUrl)
    
    if (!data.status) {
      return m.reply('*[❗] No se pudo obtener una respuesta de la API de Gemini.*')
    }
    
    const response = data.data?.trim() || 'No se obtuvo respuesta de Gemini.'
    
    await conn.sendMessage(m.chat, {
      text: response
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en comando gemini:', e)
    m.reply('*[❗] Ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#gemini <texto>']
handler.tags = ['inteligencia']
handler.command = /^(gemini|geminiai|googleai)$/i

export default handler
