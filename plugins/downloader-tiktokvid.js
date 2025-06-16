import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) return conn.reply(
    m.chat,
    '𖧊 Hola, necesito que me proporciones el nombre del video *Tiktok* que deseas Buscar.',
    m,
    rcanal
  )

  await m.react('🕓')
  try {
    let url = `https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(args.join(' '))}&apikey=a7q587awu57`
    let res = await fetch(url)
    if (!res.ok) throw await res.text()

    let json = await res.json()
    let result = json.data

    await conn.sendFile(m.chat, 'tiktok.mp4', null, m, rcanal)
    await m.react('✅')

  } catch {
    await m.react('✖️')
  }
}

handler.help = ['tiktokvid *<nombre>*']
handler.tags = ['downloader']
handler.command = /^(ttvid|tiktokvid)$/i

export default handler
