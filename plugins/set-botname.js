import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `Este comando requiere que escribas un nombre para continuar.`, m, rcanal)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, 'No tienes ningún sub bot activo o tu sesión ha expirado.', m, rcanal)
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
    return conn.reply(m.chat, `El nombre **${text.trim()}** será visible en menús y respuestas del bot desde ahora.`, m, rcanal)
  } catch {}
}

handler.help = ['setbotname']
handler.tags = ['serbot']
handler.command = /^setbotname$/i

export default handler
