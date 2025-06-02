import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `✿ Ingresa el nombre del video que deseas buscar en *YouTube.*`, m)

  await m.react('🔍')
  let img = `./storage/img/menu.jpg`

  try {
    // Usamos una API de búsqueda de YouTube (puedes cambiarla si tienes otra)
    const { data } = await axios.get(`https://api.lolhuman.xyz/api/ytsearch?apikey=TuApiKeyAqui&query=${encodeURIComponent(text)}`)

    const results = data?.result || []

    if (results.length > 0) {
      let txt = `*✿ Resultados de búsqueda en YouTube:*`

      for (let i = 0; i < (results.length >= 10 ? 10 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `*• Nro →* ${i + 1}\n`
        txt += `*• Título →* ${video.title || 'Sin título'}\n`
        txt += `*• Duración →* ${video.duration || 'Desconocida'}\n`
        txt += `*• Canal →* ${video.uploader || 'Desconocido'}\n`
        txt += `*• Url →* ${video.link}`
      }

      await conn.sendFile(m.chat, img, 'youtube-thumbnail.jpg', txt, m)
      await m.react('✅')
    } else {
      await conn.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['search-youtube *<término>*']
handler.command = ['youtube', 'ytsearch', 'searchyoutube']

export default handler