import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, '[ ✰ ] Ingresa el nombre de la aplicación que deseas descargar de *Aptoide* junto al comando.\n\n`» Ejemplo :`\n' + `> *${usedPrefix + command}* WhatsApp`, m)

  await m.react('🕓')

  try {
    // Buscar la aplicación en Aptoide usando su API pública
    const res = await axios.get(`https://api.starlights.uk/api/downloader/aptoide?text=texto=${encodeURIComponent(text)}`)
    const app = res.data[0]

    if (!app) {
      await m.react('❌')
      return conn.reply(m.chat, '[ ✘ ] No se encontró ninguna aplicación con ese nombre.', m)
    }

    const { uname, size, icon, developer, file, stats } = app
    const readableSize = (size / 1024 / 1024).toFixed(2) + ' MB'

    // Verificar si el tamaño del archivo es mayor a 300 MB
    if (size > 300 * 1024 * 1024) {
      return await m.reply('El archivo pesa más de 300 MB, se canceló la descarga.')
    }

    // Preparar el mensaje con la información de la aplicación
    let txt = `*乂  A P T O I D E  -  D O W N L O A D*\n\n`
    txt += `  ✩   *Nombre* : ${app.title}\n`
    txt += `  ✩   *Versión* : ${file.vername}\n`
    txt += `  ✩   *Descargas* : ${stats.downloads}\n`
    txt += `  ✩   *Peso* :  ${readableSize}\n`
    txt += `  ✩   *Desarrollador* : ${developer.name}\n\n`
    txt += `*- ↻ El archivo se está enviando, espera un momento...*`

    // Enviar la miniatura con la información
    await conn.sendFile(m.chat, icon, 'thumbnail.jpg', txt, m)

    // Enviar el archivo APK
    await conn.sendMessage(m.chat, {
      document: { url: file.path },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${app.title}.apk`,
      caption: null
    }, { quoted: m })

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('❌')
    conn.reply(m.chat, '[ ✘ ] Ocurrió un error al buscar o descargar la aplicación. Intenta nuevamente.', m)
  }
}

handler.help = ['aptoide *<búsqueda>*']
handler.tags = ['downloader']
handler.command = ['aptoide', 'apk']
handler.register = true

export default handler
