import axios from 'axios'
import { join } from 'path'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'
  let imgBot = './storage/img/menu3.jpg'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
      if (config.img) imgBot = config.img
    } catch (err) {}
  }

  if (!text) return conn.reply(m.chat, `¿Qué te gustaría ver en YouTube, cielo?\nSolo dime el nombre, y con gusto te lo buscare\n\nEjemplo:\n\n* .yts BLACKPINK – Pink Venom\n* .yts Paulo Londra\n\nBuscaré con cariño y te mostraré lo más relevante que encuentre.\n\n> LOVELLOUD Official`, m, rcanal)

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/search/youtube?q=q=${encodeURIComponent(text)}`)
    const results = data?.result || []

    if (results.length > 0) {
      let txt = `「 *• Searchs* 」`

      for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `* Nro → ${i + 1}\n`
        txt += `* Título → ${video.title || 'Sin título'}\n`
        txt += `* Duración → ${video.duration || 'Desconocida'}\n`
        txt += `* Canal → ${video.uploader || 'Desconocido'}\n`
        txt += `* Url → ${video.link}`
      }

      await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', txt, m, null, rcanal)
    }
  } catch {}
}

handler.tags = ['search']
handler.help = ['youtubesearch']
handler.command = ['youtubesearch', 'youtubes', 'yts']

export default handler
