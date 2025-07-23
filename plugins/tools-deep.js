import fetch from 'node-fetch'
import { join } from 'path'
import fs from 'fs'

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

  if (!text) return conn.reply(m.chat, `¿Estás bien, corazón?\nSi algo pesa en tu alma, estoy aquí… para escucharte, sin juicios, con cariño.\n\n* A veces, las preguntas más silenciosas son las que más gritan por dentro\n\n* Hay silencios que duelen más que mil palabras no dichas\n\n> LOVELLOUD Official`, m, rcanal)

  try {
    let api = await fetch(`https://api-pbt.onrender.com/api/ai/model/deepseek?texto=${encodeURIComponent(text)}&apikey=8jkh5icbf05`)
    let json = await api.json()

    if (json?.data) {
      await conn.reply(m.chat, json.data.trim(), m, rcanal)
    }
  } catch {}
}

handler.help = ['deepseek']
handler.tags = ['tools']
handler.command = /^(deep|deepseek|deeps)$/i

export default handler
