import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('❌ No encontré tu sub bot activo.')
  }

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    return m.reply(`> 📸 Usa así:\n*${usedPrefix + command} https://example.com/banner.jpg*, osea sube la imagen a un hosting de imágenes como catbox.moe`)
  }

  try {
    const imgBuffer = await q.download?.()
    if (!imgBuffer) return m.reply('❌ No pude descargar la imagen.')

    const fileName = `logo_${Date.now()}.jpg`
    const filePath = path.join(botPath, fileName)
    fs.writeFileSync(filePath, imgBuffer)

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = filePath // guarda la ruta local

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply('✅ Logo actualizado correctamente.')
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al guardar el logo.')
  }
}

handler.help = ['setlogo']
handler.tags = ['serbot']
handler.command = /^setlogo$/i
handler.owner = false
export default handler