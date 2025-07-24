import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {}
  }

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, `¿Hola, cómo te va?\n\n* No encontré una sesión activa vinculada a tu número\n\n* Puede que aún no te hayas conectado\n\n* Si deseas iniciar una nueva, estaré aquí para ayudarte\n\n> LOVELLOUD Official`, m, rcanal)
  }

  if (!text) return conn.reply(m.chat, `Indícame con qué nombre quieres llamar a la moneda, para continuar. cielo\n\nEjemplo:\n\n* .setbotcoins Galletas\n* .setbotcoins Corazones\n\n> LOVELLOUD Official`, m, rcanal)

  const configPathUser = path.join(botPath, 'config.json')
  let config = {}

  if (fs.existsSync(configPathUser)) {
    try {
      config = JSON.parse(fs.readFileSync(configPathUser))
    } catch {}
  }

  config.name = text.trim()

  try {
    fs.writeFileSync(configPathUser, JSON.stringify(config, null, 2))
    return conn.reply(m.chat, `Moneda personalizada con éxito.\n\nAhora tus monedas se llamarán:\n* (${text.trim()})\n\n> LOVELLOUD Official`, m, rcanal)
  } catch {}
}

handler.help = ['setbotcoins']
handler.tags = ['serbot']
handler.command = /^setbotcoins$/i

export default handler
