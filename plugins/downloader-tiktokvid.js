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
      sin_marca_de_agua
    } = result

    await conn.sendFile(m.chat, sin_marca_de_agua, `tiktok.mp4`, m, rcanal)
    await m.react('✅')

  } catch {
    await m.react('✖️')
  }
}

handler.help = ['tiktokvid']
handler.tags = ['downloader']
handler.command = ['ttvid', 'tiktokvid']

export default handler
