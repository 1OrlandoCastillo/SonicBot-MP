import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `✿ Ingresa el enlace de un video de *TikTok* que deseas descargar.`, m)
  }

  await m.react('🕓')

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/downloader/tiktok?url=URL=${encodeURIComponent(text)}`)

    if (!data || !data.result || !data.result.video) {
      await m.react('✖️')
      return conn.reply(m.chat, '✖️ No se pudo obtener el video. Verifica que el enlace sea válido.', m)
    }

    let caption = `*✅ TIKTOK DOWNLOADER*\n\n`
    caption += `*• Autor:* ${data.result.author.nickname || 'Desconocido'}\n`
    caption += `*• Título:* ${data.result.title || 'Sin título'}\n`
    caption += `*• Likes:* ${data.result.statistics?.diggCount || 0}\n`
    caption += `*• Comentarios:* ${data.result.statistics?.commentCount || 0}\n`
    caption += `*• Compartidos:* ${data.result.statistics?.shareCount || 0}`

    await conn.sendFile(m.chat, data.result.video, 'tiktok.mp4', caption, m)
    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    conn.reply(m.chat, '⚠️ Ocurrió un error al intentar descargar el video.', m)
  }
}

handler.help = ['tiktokdl *<enlace>*']
handler.tags = ['downloader']
handler.command = ['tiktokdl', 'tiktokdescargar']

export default handler