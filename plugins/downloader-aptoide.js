import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) {
    return conn.reply(m.chat, `✿ Ingresa el nombre de la app que deseas buscar en *Aptoide.*`, m)
  }

  await m.react('🔍')

  let img = `./storage/img/menu.jpg`

  try {
    // Búsqueda en la API de Aptoide
    const { data } = await axios.get(`https://api.starlights.uk/api/downloader/aptoide?text=texto=${encodeURIComponent(text)}&limit=10`)
    const results = data?.datalist?.list || []

    if (results.length > 0) {
      let response = `*✿ Resultados para:* ${text}`

      for (let i = 0; i < results.length; i++) {
        const app = results[i]
        response += `\n\n`
        response += `*• Nro →* ${i + 1}\n`
        response += `*• Nombre →* ${app.name || 'Desconocido'}\n`
        response += `*• Versión →* ${app.file.vername || 'N/A'}\n`
        response += `*• Descargas →* ${app.stats?.downloads || 'N/A'}\n`
        response += `*• URL →* ${app.file?.path || 'No disponible'}`
      }

      await conn.sendFile(m.chat, img, 'aptoide.jpg', response, m)
      await m.react('✅')
    } else {
      await m.react('❌')
      await conn.reply(m.chat, `✿ No se encontraron resultados para: *${text}*`, m)
    }
  } catch (error) {
    await m.react('❌')
    await conn.reply(m.chat, `✿ Error al buscar la app. Vuelve a intentarlo más tarde.`, m)
    console.error(error)
  }
}

handler.tags = ['downloader']
handler.help = ['aptoide *<nombre de la app>*']
handler.command = ['aptoide', 'aptoidesearch']

export default handler