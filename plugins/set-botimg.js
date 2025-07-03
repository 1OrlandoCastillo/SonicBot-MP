import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, 'No hay ninguna sesión activa vinculada a tu número.', m, rcanal)
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return conn.reply(m.chat, `Contesta con una imagen para usarla como nueva imagen.`, m, rcanal)
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
    return conn.reply(m.chat, 'Tu sub bot ya tiene una nueva imagen visible para todos.', m, rcanal)
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['setbotimg']
handler.tags = ['serbot']
handler.command = /^setbotimg$/i

export default handler
