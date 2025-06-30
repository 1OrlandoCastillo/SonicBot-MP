import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, 'Parece que no hay ninguna sesión activa vinculada a tu número en este momento.', m, rcanal)
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return conn.reply(m.chat, `Necesitas responder directamente a una imagen enviada en el chat para que el bot la reconozca y la utilice como nuevo logo.`, m, rcanal)
  }

  try {
    const imgBuffer = await q.download?.()
    if (!imgBuffer) return

    const fileName = `logo_${Date.now()}.jpg`
    const filePath = path.join(botPath, fileName)
    fs.writeFileSync(filePath, imgBuffer)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.logo = filePath

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return conn.reply(m.chat, 'Tu sub bot ahora tiene una nueva imagen que se mostrará para todos los usuarios.', m, rcanal)
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['setlogo']
handler.tags = ['serbot']
handler.command = /^setlogo$/i

export default handler
