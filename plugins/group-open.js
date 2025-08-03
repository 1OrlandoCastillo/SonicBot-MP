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
        text: `《✧》Este grupo ya está abierto.`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    
    return conn.sendMessage(m.chat, {
      text: `「✿」Grupo abierto exitosamente.\n\nⴵ Admin: @${m.sender.split('@')[0]}\n❖ Grupo: ${groupName}`,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error al abrir grupo:', e)
    return conn.sendMessage(m.chat, {
      text: 'Debo ser admin para ejecutar este Comando.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['open', 'abrir', 'grupo-abierto']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler