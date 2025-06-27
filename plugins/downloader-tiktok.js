import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return conn.reply(m.chat, 'Por favor, envía un enlace de TikTok para descargar el video.\n\n📌 *Ejemplo:*\n' +
      `> *${usedPrefix + command}* https://www.tiktok.com/@usuario/video/1234567890`, m)
  }

  await m.react('💎')

  try {
    const res = await fetch(`https://g-mini-ia.vercel.app/api/tiktok?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw new Error('❌ La API no respondió correctamente')

    const json = await res.json()
    if (!json || !json.video_url) {
      throw new Error('❌ No se pudo obtener el video.')
    }

    const { video_url, title, author } = json

    const info = `
╭──────╮
│ *🎬 Título:* ${title || 'No disponible'}
│ *👤 Autor:* ${author || 'Desconocido'}
╰──────╯`

    await conn.sendFile(m.chat, video_url, 'tiktok.mp4', `${info}\n\n✨ ¡Aquí tienes tu video`, m, null rcanal)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Error al descargar el video. Verifica el enlace o intenta más tarde.', m)
  }
}

handler.help = ['tiktok <enlace>']
handler.tags = ['downloader']
handler.command = /^(tiktok|tt|tiktokdl|ttdl)$/i

export default handler
