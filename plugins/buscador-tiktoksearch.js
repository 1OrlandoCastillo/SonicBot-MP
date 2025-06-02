.import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `🚩 Ingresa el nombre del video que deseas buscar en TikTok.\n\nEjemplo:\n> *${usedPrefix + command}* Ai Hoshino Edit`, m)

  await m.react('🕓')
  let img = `./storage/img/menu.jpg`

  try {
    // Llamada a la API externa de búsqueda de TikTok
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)

    const results = data?.data || []

    if (results.length > 0) {
      let txt = `*乂  T I K T O K  -  S E A R C H*`

      for (let i = 0; i < (results.length >= 50 ? 50 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `  *» Nro* : ${i + 1}\n`
        txt += `  *» Título* : ${video.title || 'Sin título'}\n`
        txt += `  *» Autor* : ${video.author || 'Desconocido'}\n`
        txt += `  *» Url* : ${video.nowm || video.url}`
      }

      await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)
      await m.react('✅')
    } else {
      await m.react('✖️')
      await conn.reply(m.chat, '⚠️ No se encontraron resultados para esa búsqueda.', m)
    }

  } catch (err) {
    console.error(err)
    await m.react('✖️')
    await conn.reply(m.chat, '⚠️ Ocurrió un error al buscar en TikTok.', m)
  }
}

handler.tags = ['search']
handler.help = ['tiktoksearch *<búsqueda>*']
handler.command = ['tiktoksearch', 'tiktoks']

export default handler
