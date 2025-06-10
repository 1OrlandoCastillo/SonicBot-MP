let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) return conn.reply(m.chat, '🚩 Ingresa un enlace del vídeo de TikTok junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m, rcanal)
  if (!args[0].match(/tiktok/gi)) return conn.reply(m.chat, `Verifica que el link sea de TikTok`, m, rcanal).then(_ => m.react('✖️'))

  await m.react('🕓')

  try {
    let res = await fetch(`https://api.sylphy.xyz/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=sylph-c57e298ea6`)
    if (!res.ok) throw await res.text()
    let json = await res.json()
    let { title, author, duration } = json.data
    let type = json.type
    let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `	✩  *Título* : ${title}\n`
    txt += `	✩  *Autor* : ${author}\n`
    txt += `	✩  *Duración* : ${duration} segundos\n`
    txt += `	✩  *Vistas* : No disponible\n`
    txt += `	✩  *Likes* : No disponible\n`
    txt += `	✩  *Comentarios* : No disponible\n`
    txt += `	✩  *Compartidos* : No disponible\n`
    txt += `	✩  *Publicado* : No disponible\n`
    txt += `	✩  *Descargas* : No disponible`

    if (type === 'video') {
      let videoURL = json.dl.url
      await conn.sendFile(m.chat, videoURL, 'tiktok.mp4', txt, m, null, rcanal)
    } else if (type === 'image') {
      await conn.reply(m.chat, txt + '\n\n📷 Contenido tipo imagen detectado. Enviando imágenes...', m, rcanal)
      for (let i = 0; i < json.dl.url.length; i++) {
        await conn.sendFile(m.chat, json.dl.url[i], `img${i + 1}.jpg`, '', m)
      }
    } else {
      await conn.reply(m.chat, '❌ Tipo de contenido no soportado.', m)
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Hubo un error al procesar el enlace.', m)
  }
}

handler.help = ['tiktok']
handler.tags = ['downloader']
handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm)$/i

export default handler
