let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) return conn.reply(m.chat, '🚩 Ingresa un enlace del vídeo de TikTok junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m, rcanal)
  if (!args[0].match(/tiktok/gi)) return conn.reply(m.chat, `Verifica que el link sea de TikTok`, m, rcanal).then(_ => m.react('✖️'))

  await m.react('🕓')

  try {
    let res = await fetch(`https://api.sylphy.xyz/download/tiktok?url=${encodeURIComponent(args[0])}`)
    if (!res.ok) throw await res.text()
    let { title, author, duration, views, likes, comment, share, published, downloads, videoURL } = await res.json()

    let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `	✩  *Título* : ${title}\n`
    txt += `	✩  *Autor* : ${author}\n`
    txt += `	✩  *Duración* : ${duration} segundos\n`
    txt += `	✩  *Vistas* : ${views}\n`
    txt += `	✩  *Likes* : ${likes}\n`
    txt += `	✩  *Comentarios* : ${comment}\n`
    txt += `	✩  *Compartidos* : ${share}\n`
    txt += `	✩  *Publicado* : ${published}\n`
    txt += `	✩  *Descargas* : ${downloads}`

    await conn.sendFile(m.chat, videoURL, 'tiktok.mp4', txt, m, null, rcanal)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Hubo un error al procesar el enlace.', m)
  }
}

handler.help = ['tiktok *<url tt>*']
handler.tags = ['downloader']
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm)$/i

export default handler
