import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) { }
  }

  if (!text) return conn.reply(m.chat, `🪷 ¿Estás bien?\nEstoy aquí si necesitas hablar o preguntar algo. 🌧️💗\n\n𝟏 :: ¿Por qué a veces me siento sol@?\n𝟐 :: ¿Cómo puedo superar la tristeza?\n𝟑 :: ¿Qué es el amor de verdad?\n𝟒 :: ¿Por qué me cuesta confiar en las personas?\n𝟓 :: ¿Cómo encontrar mi propósito?\n𝟔 :: ¿Puedo ser feliz aunque todo parezca difícil?\n\n🎀 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)

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

handler.help = ['deepseek']
handler.tags = ['tools']
handler.command = /^(deep|deepseek|deeps)$/i

export default handler
