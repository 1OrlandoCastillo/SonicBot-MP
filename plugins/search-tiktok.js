import axios from 'axios'
import { join } from 'path'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `Indica qué quieres buscar en TikTok con un nombre, título o descripción.`, m, rcanal)

await m.react('🕓')
let imgBot = './storage/img/menu3.jpg'

const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
const config = JSON.parse(fs.readFileSync(configPath))
        if (config.img) imgBot = config.img
      } catch (err) {
      }
    }

try {
const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)

const results = data?.data || []

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
      await conn.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['tiktoksearch']
handler.command = ['tiktoksearch', 'tiktoks', 'tts']

export default handler
