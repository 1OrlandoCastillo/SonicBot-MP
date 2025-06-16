import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*Ingresa tu petición.*\n\n🪼 *Ejemplo:* ${usedPrefix + command} como hacer estrella de papel`, m, rcanal)

  await m.react('💬')

  try {
    let api = await fetch(`https://api-pbt.onrender.com/api/ai/model/deepseek?texto=${encodeURIComponent(text)}&apikey=8jkh5icbf05`)
    let json = await res.json()
    if (json.result) {
      await conn.reply(m.chat, json.result, m, rcanal)
    }
  } catch {}
}

handler.help = ['deepsek']
handler.tags = ['tools']
handler.command = /^(deep|deepseek|deeps)$/i

export default handler
