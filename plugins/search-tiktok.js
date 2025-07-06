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

  if (!text) return conn.reply(m.chat, `🪷 : Acción :: Búsqueda en TikTok\n🎀 : Instrucción :: Escriba un nombre, título o descripción\n⛩️ : Comando :: .tts\n🍥 : Ejemplo 1 :: .tts Recetas fáciles\n🌸 : Ejemplo 2 :: .tts Trucos de estudio\n💮 : Ejemplo 3 :: .tts Moda coreana\n🌼 : Estado :: Esperando solicitud\n🍓 : Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)

  await m.react('🕓')

  try {
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)
    const results = data?.result || []

    if (results.length > 0) {
      let txt = `「 *• Searchs* 」`

      for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `*◦Nro →* ${i + 1}\n`
        txt += `*◦Título →* ${video.title || 'Sin título'}\n`
        txt += `*◦Url →* ${video.url}`
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
handler.help = ['tiktoksearch']
handler.command = ['tiktoksearch', 'tiktoks', 'tts']

export default handler
