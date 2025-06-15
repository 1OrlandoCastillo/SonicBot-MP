import fs from 'fs'
import path from 'path'

let handler = async (m, { args, conn, usedPrefix, command }) => {
  let name = args.join(' ').trim()
  if (!name) return m.reply(`✿ Ingresa un nombre para el bot.\n\n*Ejemplo:* ${usedPrefix + command} StarBot`)

  let sessionFolder = conn?.auth?.creds?.me?.id?.split(':')[0] // ID de sesión del sub-bot
  if (!sessionFolder) return m.reply('⚠️ No se pudo identificar el Sub-Bot.')

  let configPath = path.join(`./${jadi}/${sessionFolder}`, 'config.json')

  let config = {}
  if (fs.existsSync(configPath)) {
    try { config = JSON.parse(fs.readFileSync(configPath)) } catch { }
  }
  config.botname = name
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

  m.reply(`✅ Nombre del bot actualizado a *${name}*`)
}
handler.help = ['setbotname <nombre>']
handler.tags = ['serbot']
handler.command = /^setbotname$/i
export default handler
