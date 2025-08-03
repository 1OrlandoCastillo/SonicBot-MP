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
    
  
    if (groupMetadata.announce) {
      return conn.sendMessage(m.chat, {
        text: `《✧》Este grupo ya está cerrado.`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    await conn.groupSettingUpdate(m.chat, 'announcement')
    
    return conn.sendMessage(m.chat, {
      text: `「✦」Grupo cerrado exitosamente.\n\n❖ Grupo: ${groupName}\n✰ Admin: @${m.sender.split('@')[0]}`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error al cerrar grupo:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Debo ser admin para ejecutar este Comando.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['close', 'cerrar', 'grupo-cerrado']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler