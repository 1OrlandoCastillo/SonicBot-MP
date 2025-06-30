import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `Para poder ayudarte correctamente, debes escribir el nombre, título, o una descripción relacionada al contenido que estás buscando en YouTube.`, m, rcanal)

await m.react('🕓')
let imgBot = './storage/img/menu3.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.img) imgBot = config.img
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
    }

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
      await conn.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['youtubesearch']
handler.command = ['youtubesearch', 'youtubes', 'yts']

export default handler
