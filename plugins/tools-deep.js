import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🚩 Ingrese su petición\n📌 *Ejemplo de uso:* ${usedPrefix + command} como hacer estrella de papel`, m, rcanal)

  await m.react('💬')

  try {
    let api = await fetch(`https://api-pbt.onrender.com/api/ai/model/deepseek?texto=${encodeURIComponent(text)}&apikey=8jkh5icbf05`)
    let json = await api.json()

    if (json?.data) {
      await conn.reply(m.chat, json.data.trim(), m, rcanal)
    } else {
      await m.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.help = ['deepseek *<petición>*']
handler.tags = ['tools']
handler.command = /^(deep|deepseek|deeps)$/i

export default handler
