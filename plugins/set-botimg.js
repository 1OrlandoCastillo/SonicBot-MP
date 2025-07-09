import fs from 'fs'
import path from 'path'
import { join } from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configGlobalPath = path.join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'
  if (fs.existsSync(configGlobalPath)) {
    try {
      const globalConfig = JSON.parse(fs.readFileSync(configGlobalPath))
      if (globalConfig.name) nombreBot = globalConfig.name
    } catch {}
  }

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Serbot', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, `💭 Lo siento, no encontré ninguna sesión activa vinculada a tu número...\n\n🌸 Puede que aún no te hayas conectado\n🍥 O quizá tu sesión haya expirado sin avisarme\n🪷 Si deseas iniciar una nueva, estaré aquí para ayudarte\n\n🎀 Usa el comando :: .qr o .code para comenzar\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m rcanal)
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return conn.reply(m.chat, `🎀 Para continuar, necesito que respondas a una imagen.\n¿Podrías enviarme una y luego responderla con el comando? 🌸\n\n𝟏 :: Envía o reenvía una imagen\n𝟐 :: Respóndela con :: .setbotimg\n\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m rcanal)
  }

  try {
    const imgBuffer = await q.download?.()
    if (!imgBuffer) return

    const fileName = `img_${Date.now()}.jpg`
    const filePath = path.join(botPath, fileName)
    fs.writeFileSync(filePath, imgBuffer)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.img = filePath

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    return conn.reply(m.chat, `🪷 ¡Imagen recibida con elegancia!\n\n🎀 Tu imagen personalizada ha sido guardada correctamente.\n🍥 Será utilizada en tu menú y otros momentos especiales.\n\n💮 Puedes cambiarla nuevamente cuando lo desees.\n\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m rcanal)
  } catch (e) {
    return conn.reply(m.chat, `💥 Ocurrió un error al guardar tu imagen...\n\n🌸 Inténtalo nuevamente o asegúrate de que sea una imagen válida.\n\n🍓 Asistente :: ${nombreBot}\n\n> LOVELLOUD Official`, m rcanal)
  }
}

handler.help = ['setbotimg']
handler.tags = ['serbot']
handler.command = /^setbotimg$/i

export default handler
