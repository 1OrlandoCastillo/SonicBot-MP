import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return conn.reply(
      m.chat,
      '🚩 Ingresa un texto junto al comando.\n\n`Ejemplo:`\n' +
      `> *${usedPrefix + command}* Anya`,
      m, rcanal
    )
  }

  await m.react('🕓')
  try {
    let url = `https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(args.join(' '))}&apikey=a7q587awu57`
    let res = await fetch(url)
    if (!res.ok) throw await res.text()
    
    let json = await res.json()
    let result = json.data

    if (!result || !result.sin_marca_de_agua) throw '❌ No se encontró ningún resultado válido.'

    let {
      titulo,
      autor,
      duracion,
      vistas,
      likes,
      comentarios,
      compartidos,
      fecha_subida,
    } = result

    let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `    ✩  *Título* : ${titulo}\n`
    txt += `    ✩  *Autor* : ${autor}\n`
    txt += `    ✩  *Duración* : ${duracion} segundos\n`
    txt += `    ✩  *Vistas* : ${vistas}\n`
    txt += `    ✩  *Likes* : ${likes}\n`
    txt += `    ✩  *Comentarios* : ${comentarios}\n`
    txt += `    ✩  *Compartidos* : ${compartidos}\n`
    txt += `    ✩  *Publicado* : ${fecha_subida}`

    await conn.sendFile(m.chat, 'tiktok.mp4', txt, m, null, rcanal)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Ocurrió un error al procesar tu solicitud.', m)
  }
}

handler.help = ['tiktokvid *<nombre>*']
handler.tags = ['downloader']
handler.command = /^(ttvid|tiktokvid)$/i

export default handler
