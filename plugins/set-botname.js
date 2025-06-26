import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args }) => {
  const sessionId = conn?.auth?.creds?.me?.id?.split(':')[0] || m.sender.split('@')[0]
  const dir = `./JadiBots/${sessionId}`
  const configPath = path.join(dir, 'config.json')

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  let config = {}
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch {
      config = {}
    }
  }

  const name = args.join(' ')
  if (!name) return m.reply('❎ Ingresa un nombre para el bot.\n\nEjemplo:\n*.setbotname SakuraBot*')

  config.botname = name // ✅ esta es la clave correcta que tu menú espera
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  m.reply(`✅ El nombre del bot fue actualizado a:\n*${name}*`)
}

handler.help = ['setbotname <nombre>']
handler.tags = ['serbot']
handler.command = /^setbotname$/i
handler.owner = true

export default handler
