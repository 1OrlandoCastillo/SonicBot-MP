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
    return conn.reply(m.chat, `💭 Lo siento, no encontré ninguna sesión activa vinculada a tu número...\n\n🌸 Puede que aún no te hayas conectado\n🍥 O quizá tu sesión haya expirado sin avisarme\n🪷 Si deseas iniciar una nueva, estaré aquí para ayudarte\n\n🎀 Usa el comando :: .qr o .code para comenzar\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)
  }

  if (!text) return conn.reply(m.chat, `🎀 Necesito un nombre para continuar, cielo.\n¿Podrías decírmelo con dulzura? 🌸\n\n𝟏 :: Ejemplo :: .setbotname BLACKPINK\n𝟐 :: Ejemplo :: .setbotname Gatitos\n𝟑 :: Ejemplo :: .setbotname LaLisa\n\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)

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
    return conn.reply(m.chat, `🪷 ¡Nuevo nombre recibido con gracia!\n\n🎀 Ahora me llamaré :: ${text.trim()}\n🌸 Qué bonito suena... ¿verdad?\n🍥 Estoy list@ para servirte como siempre, pero con un toque renovado ✨\n\n💮 Si cambias de opinión, puedes volver a nombrarme cuando gustes.\n\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m, rcanal)
  } catch {}
}

handler.help = ['setbotname']
handler.tags = ['serbot']
handler.command = /^setbotname$/i

export default handler
