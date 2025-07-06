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
    } catch (err) { }
  }

  if (!text) return conn.reply(m.chat, `🪷 : Acción :: Búsqueda en YouTube\n🎀 : Instrucción :: Escriba un nombre, título o descripción\n⛩️ : Comando :: .yts\n🍥 : Ejemplo 1 :: .yts BLACKPINK – Pink Venom\n🌸 : Ejemplo 2 :: .yts Documental sobre el té\n💮 : Ejemplo 3 :: .yts Canción suave para estudiar\n🌼 : Estado :: Esperando solicitud\n🍓 : Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)

  await m.react('🕓')

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/search/youtube?q=q=${encodeURIComponent(text)}`)
    const results = data?.result || []

    if (results.length > 0) {
      let txt = `「 *• Searchs* 」`

      for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `*◦Nro →* ${i + 1}\n`
        txt += `*◦Título →* ${video.title || 'Sin título'}\n`
        txt += `*◦Duración →* ${video.duration || 'Desconocida'}\n`
        txt += `*◦Canal →* ${video.uploader || 'Desconocido'}\n`
        txt += `*◦Url →* ${video.link}`
      }

      await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', txt, m, null, rcanal)
      await m.react('✅')
    } else {
      await m.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['youtubesearch']
handler.command = ['youtubesearch', 'youtubes', 'yts']

export default handler
