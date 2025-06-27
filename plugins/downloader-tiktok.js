import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return conn.reply(m.chat, `🚩 Ingresa un enlace del vídeo de *TikTok* junto al comando.\n\n` +
      `> *Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZMrFCX5jf/`, m)
  }

  if (!args[0].match(/tiktok/i)) {
    await m.react('✖️')
    return conn.reply(m.chat, '🚫 Verifica que el enlace sea de TikTok.', m)
  }

  await m.react('🕓')

  try {
    const res = await fetch(`https://g-mini-ia.vercel.app/api/tiktok?url=${encodeURIComponent(args[0])}`)
    const json = await res.json()

    let {
      title = 'Sin título',
      author = 'Desconocido',
      video: { url: dl_url } = {}
    } = json?.data || {}

    if (!dl_url) return await m.react('✖️')

    let txt = `	✩  *Título:* ${title}\n`
    txt += `	✩  *Autor:* ${author}`

    await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal)
    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.help = ['tiktok *<url>*']
handler.tags = ['downloader']
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm)$/i

export default handler
