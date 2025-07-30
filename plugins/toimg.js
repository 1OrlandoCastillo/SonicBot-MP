import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    
    if (!/webp/.test(mime)) {
      return m.reply(`*[❗] Responde a un sticker con el comando ${usedPrefix + command} para convertirlo en imagen*`)
    }
    
    
    const media = await quoted.download()
    
    const buffer = await webp2png(media)
    
    await conn.sendFile(m.chat, buffer, 'sticker.png', '', m)
    
  } catch (e) {
    console.error('Error en toimg:', e)
    m.reply('*[❗] Ocurrió un error al procesar el sticker. Asegúrate de estar respondiendo a un sticker válido.*')
  }
}

handler.help = ['#toimg']
handler.tags = ['stickers']
handler.command = /^(toimg|aimg|stickeraimagen)$/i

export default handler
