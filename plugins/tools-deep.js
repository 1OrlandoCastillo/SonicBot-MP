import LOVELLOUD from '@LOVELLOUD/Scraper'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `Ingrese su petición*\n*Ejemplo de uso:* ${usedPrefix + command} como hacer estrella de papel`, m, rcanal)

  await m.react('💬')

  try {
    let { msg } = await LOVELLOUD.openAi(text)
    await conn.reply(m.chat, msg, m, rcanal)
  } catch {
    try {
      let { result } = await LOVELLOUD.ChatGpt(text)
      await conn.reply(m.chat, result, m, rcanal)
    } catch {
      try {
        let { result } = await LOVELLOUD.ChatGptV2(text)
        await conn.reply(m.chat, result, m, rcanal)
      } catch {
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
    }
  }
}

handler.help = ['deepsek *<petición>*']
handler.tags = ['tools']
handler.command = /^(deep|deepseek|deeps)$/i

export default handler
