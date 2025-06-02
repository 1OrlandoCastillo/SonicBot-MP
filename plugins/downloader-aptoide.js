import axios from 'axios'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(m.chat, `✿ Ingresa el nombre de una aplicación para buscar en *Aptoide*.\n\nEjemplo: ${usedPrefix + command} Spotify`, m)
  }

  await m.react('🔍')

  try {
    const searchUrl = `https://api.starlights.uk/api/downloader/aptoide?text=texto=${encodeURIComponent(text)}/json`
    const { data } = await axios.get(searchUrl)

    if (!data || !data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '✖️ No se encontraron resultados en Aptoide para esa búsqueda.', m)
    }

    const app = data.datalist.list[0] // Tomamos la primera coincidencia
    const appInfo = `*📱 Nombre:* ${app.name}\n*📦 Paquete:* ${app.package}\n*🧑‍💻 Desarrollador:* ${app.store.name}\n*🆕 Versión:* ${app.file.vername}\n*📥 Descarga:* ${app.file.path}`

    await conn.sendMessage(m.chat, { text: `*✅ RESULTADO ENCONTRADO:*\n\n${appInfo}` }, { quoted: m })
    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, '⚠️ Ocurrió un error al buscar la aplicación.', m)
  }
}

handler.help = ['aptoide *<nombre>*']
handler.tags = ['downloader', 'apk']
handler.command = ['aptoide', 'apksearch']

export default handler
