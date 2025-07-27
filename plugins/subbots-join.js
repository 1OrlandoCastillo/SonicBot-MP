let handler = async (m, { conn, command }) => {
  // Verifica que sea un grupo
  if (!m.isGroup) {
    return conn.reply(m.chat, `✦ El comando *${command}* solo se puede usar dentro de grupos.`, m)
  }

  // Solo el dueño del subbot (el número emparejado con el subbot) puede usar el comando
  const senderJid = m.sender // Ej: 1234567890@lid
  const botJid = conn.user.jid // Ej: 51928303585:83@s.whatsapp.net

  if (senderJid !== botJid) {
    return conn.reply(m.chat, `✦ Este comando solo puede ser usado por el número *emparejado* al Sub-Bot.`, m)
  }

  // Sale del grupo
  await conn.reply(m.chat, `✦ Gracias por dejarme ser parte del grupo.\n\nMe retiro ahora mismo.`, m)
  await conn.groupLeave(m.chat)
}

handler.command = /^salir|leave|retirate$/i
handler.group = false

export default handler
