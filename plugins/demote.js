let handler = async (m, { conn, args, participants, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('《✧》Este comando solo puede ser usado en grupos.')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('《✧》Solo los administradores pueden usar este comando.')
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply(`《✧》Debes mencionar a un usuario para poder degradarlo de administrador.\n\n> Ejemplo: ${usedPrefix + command} @usuario`)
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return m.reply('《✧》No puedes quitar admin al bot.')
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  
  if (!participant) return m.reply('《✧》No se encontró al usuario en este grupo.')
  
  if (!participant.admin) {
    return conn.sendMessage(m.chat, {
      text: `《✧》El usuario @${who.split('@')[0]} no es administrador del grupo.`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [who]
      }
    }, { quoted: m })
  }
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
  
  return conn.sendMessage(m.chat, {
    text: `❏ Admin removido exitosamente.\n\n✐ Usuario: @${who.split('@')[0]}\n✐ Grupo: ${groupMetadata.subject}\n✐ Admin: @${m.sender.split('@')[0]}`,
    contextInfo: {
      ...rcanal.contextInfo,
      mentionedJid: [who, m.sender]
    }
  }, { quoted: m })
}

handler.command = /^(demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
