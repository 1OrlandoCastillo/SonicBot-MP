.import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  const senderNumber = m.sender.replace(/\D/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, `¿Hola, cómo te va?\n\n* No encontré una sesión activa vinculada a tu número\n\n* Puede que aún no te hayas conectado\n\n* Si deseas iniciar una nueva, estaré aquí para ayudarte\n\n> LOVELLOUD Official, m, rcanal)
  }

  if (!text) return conn.reply(m.chat, `Indícame con qué nombre quieres llamar a la moneda, para continuar. cielo\n\nEjemplo:\n\n* .setbotcoins Galletas\n\n* .setbotcoins Corazones\n\n> LOVELLOUD Official`, m, rcanal)

  const configPath = path.join(botPath, 'config.json')
  let config = {}

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  config.coinName = text.trim()
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  return conn.reply(m.chat, `Moneda personalizada con éxito.\n\nAhora tus monedas se llamarán:\n* (${text.trim()})\n\n> LOVELLOUD Official`, m, rcanal)
}

handler.help = ['setbotcoins']
handler.tags = ['serbot']
handler.command = /^setbotcoins$/i

export default handler
