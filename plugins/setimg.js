import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
    throw `✳️ Responde a una imagen con:\n\n${usedPrefix + command} [1 ó 2]\n\nEjemplo:\n${usedPrefix + command} 1`
  }

  const index = args[0]
  if (!['1', '2'].includes(index)) {
    throw `✳️ Especifica qué imagen deseas cambiar (1 o 2).\nEjemplo:\n${usedPrefix + command} 1`
  }

  const img = await m.quoted.download()
  const fileName = `./storage/menu/${m.sender.split('@')[0]}_${index}.jpg`

  // Crear carpeta si no existe
  const dir = path.dirname(fileName)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(fileName, img)
  m.reply(`✅ Imagen ${index} del menú actualizada correctamente.`)
}

handler.help = ['setmenuimg <1|2>']
handler.tags = ['owner']
handler.command = ['setmenuimg']

export default handler