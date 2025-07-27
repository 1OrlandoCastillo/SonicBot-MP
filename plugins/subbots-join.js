import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, args, command }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const senderNumber = m.sender.replace(/\D/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  // Verifica si quien lo ejecuta es dueño del subbot
  if (senderNumber !== botActual) {
    return conn.reply(m.chat, `❖ El comando *${command}* solo puede ser usado por el dueño del número del *sub-bot* o el *creador del sistema*.\n\n> LOVELLOUD Official`, m, rcanal)
  }

  if (!m.isGroup) {
    return conn.reply(m.chat, `Este comando solo puede usarse dentro de grupos.\n\nPor favor, úsalos desde uno.`, m, rcanal)
  }

  // Confirmación visual y salida
  await conn.reply(m.chat, `🌸 Gracias por permitirme ser parte de este grupo.\n\nEstoy partiendo ahora...\n\n> LOVELLOUD Official`, m)
  await conn.groupLeave(m.chat)
}

handler.help = ['logout']
handler.tags = ['serbot']
handler.command = /^logout$/i

export default handler
