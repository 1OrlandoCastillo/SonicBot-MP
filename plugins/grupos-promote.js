let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '《✧》Este comando solo puede ser usado en grupos.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✧》Solo los administradores pueden usar este comando.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes mencionar al usuario que deseas promover.\n> Ejemplo: ${usedPrefix + command} @usuario`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return conn.sendMessage(m.chat, {
    text: '《✧》No puedes promover al bot.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const isUserAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
  if (isUserAdmin) {
    return conn.sendMessage(m.chat, {
      text: `《✧》El usuario @${who.split('@')[0]} ya es administrador del grupo.*`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [who]
      }
    }, { quoted: m })
  }
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    const groupName = (await conn.groupMetadata(m.chat)).subject
    
    return conn.sendMessage(m.chat, {
      text: `✿ Usuario promovido a administrador exitosamente.\n\n❒ Usuario: @${who.split('@')[0]}\n❒ Grupo: ${groupName}\n❒ Admin: @${m.sender.split('@')[0]}`,
      contextInfo: {
      ...rcanal.contextInfo,
      mentionedJid: [who, m.sender]
    }
  }, { quoted: m })
}

handler.command = /^(promote|promover|daradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler