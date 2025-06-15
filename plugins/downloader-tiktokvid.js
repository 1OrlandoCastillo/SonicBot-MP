import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `🚩 Ingresa el nombre del vídeo junto al comando.`, m)
  }

  await m.react('🕓')

  try {
    const res = await fetch(`https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(args[0])}`)
    const json = await res.json()

    if (!json.status || !json.result || !json.result.url) {
      throw '❌ No se pudo obtener el video. Verifica el enlace.'
    }

    const videoUrl = json.result.url
    await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', `✅ Video descargado con éxito.`, m)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Error al descargar el video. Asegúrate de que el enlace es válido y público.', m)
    await m.react('✖️')
  }
}

handler.help = ['ttvid']
handler.tags = ['downloader']
handler.command = /^(tiktokvid|ttvid|facebookdl|fbdl)$/i
export default handler
