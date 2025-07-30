let handler = async (m, { conn, args, participants, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('*[❗] Este comando solo puede ser usado en grupos.*')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('*[❗] Solo los administradores pueden usar este comando.*')
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply(`*[❗] Debes mencionar al administrador que deseas quitar.\nEjemplo:* ${usedPrefix + command} @usuario`)
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return m.reply('*[❗] No puedes quitar admin al bot.*')
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  
  if (!participant) return m.reply('*[❗] No se encontró al usuario en este grupo.*')
  
  if (!participant.admin) {
    return m.reply(`*[❗] El usuario @${who.split('@')[0]} no es administrador del grupo.*`, 
      null, { mentions: [who] })
  }
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    
    m.reply(
      `*[✅] Admin removido exitosamente.*\n\n` +
      `*Usuario:* @${who.split('@')[0]}\n` +
      `*Grupo:* ${groupMetadata.subject}\n` +
      `*Admin:* @${m.sender.split('@')[0]}`,
      null,
      { mentions: [who, m.sender] }
    )
    
  } catch (e) {
    console.error('Error al degradar usuario:', e)
    m.reply('*[❗] Ocurrió un error al intentar degradar al usuario. Por favor, inténtalo de nuevo.*')
  }
}

handler.help = ['#demote @usuario']
handler.tags = ['grupos']
handler.command = /^(demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
