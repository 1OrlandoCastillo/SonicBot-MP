import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `✿ Ingresa el enlace de un video de *TikTok* que deseas descargar.`, m)
  }

  await m.react('🕓')

  try {
    const url = `https://api.sylphy.xyz/download/tiktok?url=${encodeURIComponent(text)}&apikey=sylph-c57e298ea6`
    const { data } = await axios.get(url)

    if (!data || data.status !== true) {
      await m.react('✖️')
      return conn.reply(m.chat, '✖️ No se pudo obtener el contenido. Verifica que el enlace sea válido.', m)
    }

    const info = data.data
    const dl = data.dl
    const type = data.type

    let caption = `*✅ TIKTOK DOWNLOADER*\n\n`
    caption += `*• Autor:* ${info.author || 'Desconocido'}\n`
    caption += `*• Título:* ${info.title || 'Sin título'}\n`
    caption += `*• Región:* ${info.region || 'Desconocida'}\n`
    caption += `*• Duración:* ${info.duration}s\n`

    if (type === 'video') {
      await conn.sendFile(m.chat, dl.url, 'tiktok.mp4', caption, m)
    } else if (type === 'image') {
      await conn.reply(m.chat, caption + '\n*• Tipo:* Imagen\n\nEnviando imágenes...', m)
      for (let i = 0; i < dl.url.length; i++) {
        await conn.sendFile(m.chat, dl.url[i], `img${i + 1}.jpg`, '', m)
      }
    } else {
      await conn.reply(m.chat, '⚠️ Tipo de contenido no soportado.', m)
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, '⚠️ Ocurrió un error al intentar descargar el contenido.', m)
  }
}

handler.help = ['tiktokdl *<enlace>*']
handler.tags = ['downloader']
handler.command = ['tiktokdl', 'tiktokdescargar', 'tt']

export default handler
