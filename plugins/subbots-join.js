import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, args, command }) => {
  const botActual = conn.user?.id?.match(/\d{5,15}/)?.[0] || ''
  const senderNumber = m.sender.match(/\d{5,15}/)?.[0] || ''

  console.log('BOT:', conn.user?.id)
  console.log('SENDER:', m.sender)

  if (senderNumber !== botActual) {
    return conn.reply(m.chat, `❖ El comando *${command}* solo puede ser usado por el dueño del número del *sub-bot*.`, m, rcanal)
  }

  if (!m.isGroup) {
    return conn.reply(m.chat, `❖ El comando *${command}* solo puede ser usado en grupos.`, m, rcanal)
  }

  await conn.reply(m.chat, `❖ Gracias por permitirme ser parte de este grupo.\n\nEstoy partiendo ahora.`, m, rcanal)
  await conn.groupLeave(m.chat)
}

handler.help = ['logout']
handler.tags = ['subbots']
handler.command = /^logout$/i

export default handler
