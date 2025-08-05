let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  try {
    if (!m.isGroup) {
      return conn.sendMessage(m.chat, {
        text: '《✧》Este comando solo funciona en grupos.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    if (!isAdmin) {
      return conn.sendMessage(m.chat, {
        text: '《✧》Solo los administradores pueden usar este comando.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
 
    
    const action = args[0]?.toLowerCase()
    
    if (!global.db.data.antiLink) global.db.data.antiLink = {}
    
    if (action === 'on') {
      global.db.data.antiLink[m.chat] = true
      
      let txt = `╭─「 ✦ 🛡️ ᴀɴᴛɪ-ʟɪɴᴋ ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Activado\n`
      txt += `╰➺ ✧ *Acción:* Eliminar mensaje + Expulsar\n`
      txt += `╰➺ ✧ *Excepción:* Administradores\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
      txt += `\n> LOVELLOUD Official`
      
      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })
      
    } else if (action === 'off') {
      global.db.data.antiLink[m.chat] = false
      
      let txt = `╭─「 ✦ 🛡️ ᴀɴᴛɪ-ʟɪɴᴋ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Desactivado\n`
      txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
      txt += `\n> LOVELLOUD Official`
      
      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })
      
    } else {
      return conn.sendMessage(m.chat, {
        text: `《✧》Debes especificar una acción.\n\n*Ejemplo:* ${usedPrefix}antilink on\n*Ejemplo:* ${usedPrefix}antilink off`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
  } catch (e) {
    console.error('Error en antilink:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al configurar el anti-link.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['antilink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler 