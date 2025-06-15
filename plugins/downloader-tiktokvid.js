import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      '🚩 Ingresa un texto junto al comando.\n\n`Ejemplo:`\n' +
        `> *${usedPrefix + command}* Anya`,
      m
    )
  }

  await m.react('🕓')

  try {
    let url = `https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(text)}&apikey=a7q587awu57`
    let res = await fetch(url)
    if (!res.ok) throw await res.text()
    
    let json = await res.json()
    let result = json.result

    if (!result || !result.video || !result.title) throw '❌ No se encontró ningún resultado válido.'

    let {
      title,
      author,
      duration,
      views,
      likes,
      comments,
      shares,
      published,
      downloads,
      video
    } = result

    let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `    ✩  *Título* : ${title}\n`
    txt += `    ✩  *Autor* : ${author}\n`
    txt += `    ✩  *Duración* : ${duration} segundos\n`
    txt += `    ✩  *Vistas* : ${views}\n`
    txt += `    ✩  *Likes* : ${likes}\n`
    txt += `    ✩  *Comentarios* : ${comments}\n`
    txt += `    ✩  *Compartidos* : ${shares}\n`
    txt += `    ✩  *Publicado* : ${published}\n`
    txt += `    ✩  *Descargas* : ${downloads}\n\n`
    txt += `> Bot TikTok Downloader`

    await conn.sendFile(m.chat, video, `tiktok.mp4`, txt, m)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Error al obtener el video. Intenta de nuevo más tarde.', m)
    await m.react('✖️')
  }
}

handler.help = ['tiktokvid']
handler.tags = ['downloader']
handler.command = ['ttvid', 'tiktokvid']

export default handler