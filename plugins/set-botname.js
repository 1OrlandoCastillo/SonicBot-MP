import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `Debes escribir el nombre que deseas asignar junto al comando, sin dejarlo vacío.`, m, rcanal)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, 'Parece que no tienes ningún sub bot conectado actualmente o tu sesión ha expirado.', m, rcanal)
  }

  let config = {}

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch {}
  }

  config.name = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return conn.reply(m.chat, `Este será el nombre ${text.trim()} visible en los menús y respuestas del bot a partir de ahora.`, m, rcanal)
  } catch {}
}

handler.help = ['setbotname']
handler.tags = ['serbot']
handler.command = /^setbotname$/i

export default handler
