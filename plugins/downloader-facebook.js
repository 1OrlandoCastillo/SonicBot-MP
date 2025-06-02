import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args || !args[0]) return conn.reply(m.chat,`🚩 Ingresa el enlace del vídeo de Facebook junto al comando.\n\n📌 *Ejemplo:*\n> ${usedPrefix + command} https://www.facebook.com/username/videos/1234567890/`, m, rcanal)
    )
  }

  await m.react('🕓')

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/downloader/facebook?url=${encodeURIComponent(text)}`)

    if (!data || !data.data || !data.data.url) {
      throw new Error('❌ No se pudo obtener el enlace de descarga.')
    }

    const videoUrl = data.data.url
    const title = data.data.title || 'Video de Facebook'

    await conn.sendFile(m.chat, videoUrl, 'facebook.mp4', `✅ *${title}*\n\n🎬 Video descargado con éxito.`, m, null, rcanal)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    await conn.reply(m.chat, '❌ Error al descargar el video. Verifica que el enlace sea válido o intenta más tarde.', m, rcanal)
  }
}

handler.tags = ['downloader']
handler.help = ['facebook *<enlace>*']
handler.command = ['facebook', 'fb', 'facebookdl', 'fbdl']

export default handler
