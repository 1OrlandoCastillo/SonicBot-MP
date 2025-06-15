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
    let result = json.data

    if (!result || !result.sin_marca_de_agua || !result.titulo) throw '❌ No se encontró ningún resultado válido.'

    let {
      titulo,
      visualizaciones,
      me_gustas,
      comentarios,
      compartidos,
      creado_en,
      descargas,
      sin_marca_de_agua,
      musica
    } = result

    let autor = musica?.autor || 'Desconocido'
    let duracion = musica?.duracion || '¿?'
    let fecha = new Date(creado_en).toLocaleString('es-ES')

    let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
    txt += `    ✩  *Título* : ${titulo}\n`
    txt += `    ✩  *Autor* : ${autor}\n`
    txt += `    ✩  *Duración* : ${duracion} segundos\n`
    txt += `    ✩  *Vistas* : ${visualizaciones}\n`
    txt += `    ✩  *Likes* : ${me_gustas}\n`
    txt += `    ✩  *Comentarios* : ${comentarios}\n`
    txt += `    ✩  *Compartidos* : ${compartidos}\n`
    txt += `    ✩  *Publicado* : ${fecha}\n`
    txt += `    ✩  *Descargas* : ${descargas}\n\n`
    txt += `> Bot TikTok Downloader`

    await conn.sendFile(m.chat, sin_marca_de_agua, `tiktok.mp4`, txt, m)
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
