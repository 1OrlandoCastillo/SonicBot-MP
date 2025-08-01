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
  
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject
    
    
    if (!groupMetadata.announce) {
      return conn.sendMessage(m.chat, {
        text: `《✧》El grupo ya está abierto.\n\n✐ Grupo: ${groupName}`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    
    return conn.sendMessage(m.chat, {
      text: `❏ Grupo abierto exitosamente.\n\n✐ Grupo: ${groupName}\n✐ Admin: @${m.sender.split('@')[0]}`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error al abrir grupo:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Error al abrir el grupo.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = /^(open|abrir|grupo-abierto)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler 