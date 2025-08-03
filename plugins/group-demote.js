let handler = async (m, { conn, args, participants, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
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
      text: `《✧》Debes mencionar a un usuario para poder degradarlo de administrador.\n\n> Ejemplo: ${usedPrefix + command} @usuario`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return conn.sendMessage(m.chat, {
    text: '《✧》No puedes quitar admin al bot.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  
  if (!participant) return conn.sendMessage(m.chat, {
    text: '《✧》No se encontró al usuario en este grupo.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!participant.admin) {
    return conn.sendMessage(m.chat, {
      text: `《✧》@${who.split('@')[0]} no es administrador del grupo.`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [who]
      }
    }, { quoted: m })
  }
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
  
  return conn.sendMessage(m.chat, {
    text: `✦ Admin removido exitosamente.\n\nꕥ Usuario: @${who.split('@')[0]}\n✧ Admin: @${m.sender.split('@')[0]}\n❖ Grupo: ${groupMetadata.subject}`,
    contextInfo: {
      ...rcanal.contextInfo,
      mentionedJid: [who, m.sender]
    }
  }, { quoted: m })
}

handler.command = ['demote', 'degradar', 'quitaradmin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler