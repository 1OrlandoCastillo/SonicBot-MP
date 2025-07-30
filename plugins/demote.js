let handler = async (m, { conn, args, participants, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, '《✧》Este comando solo puede ser usado en grupos.', m, rcanal)
  
  if (!isAdmin && !isOwner && !isPrems) return conn.reply(m.chat, '《✧》Solo los administradores pueden usar este comando.', m, rcanal)
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return conn.reply(m.chat, `《✧》Debes mencionar a un usuario para poder degradarlo de administrador.\n\n> Ejemplo: ${usedPrefix + command} @usuario`, m, rcanal)
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return conn.reply(m.chat, '《✧》No puedes quitar admin al bot.', m, rcanal)
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  
  if (!participant) return conn.reply(m.chat, '《✧》No se encontró al usuario en este grupo.', m, rcanal)
  
  if (!participant.admin) {
    return conn.reply(m.chat, `《✧》El usuario @${who.split('@')[0]} no es administrador del grupo.`, m, rcanal, { mentions: [who] })
  }
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
  
  return conn.reply(m.chat, `❏ Admin removido exitosamente.\n\n✐ Usuario: @${who.split('@')[0]}\n✐ Grupo: ${groupMetadata.subject}\n✐ Admin: @${m.sender.split('@')[0]}`, m, rcanal, { mentions: [who, m.sender] })
}

handler.command = /^(demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
