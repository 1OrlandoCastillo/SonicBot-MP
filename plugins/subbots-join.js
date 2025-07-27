let handler = async (m, { conn, command }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, `✦ El comando *${command}* solo se puede usar en grupos.`, m)
  }

  const sender = m.sender // Ej: 1234567890@lid
  const botNumber = conn.user.jid // Ej: 51928303585:83@s.whatsapp.net

  // Extraer solo el número de ambos JIDs
  const senderNumber = sender.split('@')[0].replace(/\D/g, '')
  const botOwnerNumber = botNumber.split(':')[0].replace(/\D/g, '')

  // Comparar si el número que envió el comando es el mismo que el número del sub-bot
  if (senderNumber !== botOwnerNumber) {
    return conn.reply(m.chat, `✦ El comando *${command}* solo puede ser usado por el número *dueño del Sub-Bot*.`, m)
  }

  // Ejecutar salida del grupo
  await conn.reply(m.chat, `✦ Gracias por dejarme participar.\nMe retiro ahora.`, m)
  await conn.groupLeave(m.chat)
}

handler.command = /^salir|leave|retirate$/i
handler.group = true

export default handler
