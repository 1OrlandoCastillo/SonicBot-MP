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
  
  if (!m.quoted) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes responder al mensaje que deseas eliminar.\n\n> Ejemplo: Responde a un mensaje y escribe ${usedPrefix + command}`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
  
  try {
    
    const messageId = m.msg?.contextInfo?.stanzaId || m.quoted?.id
    
    if (!messageId) {
      return conn.sendMessage(m.chat, {
        text: '《✧》No se pudo obtener información del mensaje a eliminar.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
   
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: messageId,
        participant: m.msg?.contextInfo?.participant || m.chat
      }
    })
    
    
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })
    
  } catch (error) {
    console.error('Error al eliminar mensaje:', error)
  }
}

handler.command = ['delete', 'eliminar', 'borrar', 'del']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler 