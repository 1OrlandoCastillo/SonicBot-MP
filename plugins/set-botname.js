import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args }) => {
  const sessionId = conn?.auth?.creds?.me?.id?.split(':')[0]
  if (!sessionId) return m.reply('❎ No se pudo identificar la sesión del sub-bot.')

  const dir = `./JadiBots/${sessionId}`
  const configPath = path.join(dir, 'config.json')

  // Crear carpeta si no existe
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
  if (!name) return m.reply('❎ Por favor ingresa un nombre para el bot.\n\nEjemplo:\n*.setbotname Bot*')

  config.namebot = name
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  m.reply(`✅ El nombre del bot fue actualizado a:\n*${name}*`)
}

handler.help = ['setbotname <nombre>']
handler.tags = ['serbot']
handler.command = /^setbotname$/i
handler.owner = true

export default handler
