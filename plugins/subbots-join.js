import path from 'path'

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, `❖ El comando *${command}* solo puede ser usado en grupos.`, m, rcanal)
  }

  const sender = m.sender.split('@')[0]
  const botNumber = conn.user?.id?.split('@')[0]  // JID sin el "@s.whatsapp.net"

  if (sender !== botNumber) {
    return conn.reply(m.chat, `❖ El comando *${command}* solo puede ser usado por el dueño del número del *sub-bot*.`, m, rcanal)
  }

  await conn.reply(m.chat, `❖ Gracias por permitirme ser parte de este grupo.\n\nEstoy partiendo ahora.`, m, rcanal)
  await conn.groupLeave(m.chat)
}

handler.help = ['logout']
handler.tags = ['subbots']
handler.command = /^logout$/i

export default handler
