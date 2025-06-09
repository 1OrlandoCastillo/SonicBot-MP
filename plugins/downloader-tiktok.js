let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return conn.reply(m.chat, '🚩 Ingresa un enlace del vídeo de TikTok junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m)
  }

  if (!args[0].match(/tiktok/gi)) {
    await m.react('✖️')
    return conn.reply(m.chat, `❌ Verifica que el link sea de TikTok`, m)
  }

  await m.react('🕓') // Reloj = procesando...

  try {
    let res = await fetch(`https://api.sylphy.xyz/download/tiktok?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw await res.text()

    let { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = await res.json()

    // Verifica si el enlace realmente es un video
    let videoRes = await fetch(dl_url)
    if (!videoRes.ok || !videoRes.headers.get('content-type')?.includes('video')) {
      throw new Error('❌ El enlace de descarga no es un video válido.')
    }

    let buffer = await videoRes.buffer()

    let txt = '```乂  T I K T O K  -  D O W N L O A D```\n\n'
    txt += `✩ *Título:* ${title}\n`
    txt += `✩ *Autor:* ${author}\n`
    txt += `✩ *Duración:* ${duration} segundos\n`
    txt += `✩ *Vistas:* ${views}\n`
    txt += `✩ *Likes:* ${likes}\n`
    txt += `✩ *Comentarios:* ${comment}\n`
    txt += `✩ *Compartidos:* ${share}\n`
    txt += `✩ *Publicado:* ${published}\n`
    txt += `✩ *Descargas:* ${downloads}`

    await conn.sendMessage(m.chat, {
      video: buffer,
      caption: txt,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Hubo un error al procesar el enlace o descargar el video.', m)
  }
}

handler.help = ['tiktok *<url tt>*']
handler.tags = ['downloader']
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm)$/i

export default handler
