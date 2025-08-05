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
    
    if (!global.db.data.antiMention) global.db.data.antiMention = {}
    
    if (action === 'on') {
      global.db.data.antiMention[m.chat] = true
      
      let txt = `╭─「 ✦ 📢 ᴀɴᴛɪ-ᴍᴇɴᴄɪᴏɴᴇs ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Activado\n`
      txt += `╰➺ ✧ *Acción:* Eliminar mensaje + Advertencia\n`
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
      global.db.data.antiMention[m.chat] = false
      
      let txt = `╭─「 ✦ 📢 ᴀɴᴛɪ-ᴍᴇɴᴄɪᴏɴᴇs ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
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
        text: `《✧》Debes especificar una acción.\n\n*Ejemplo:* ${usedPrefix}antimention on\n*Ejemplo:* ${usedPrefix}antimention off`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
  } catch (e) {
    console.error('Error en antimention:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al configurar el anti-menciones.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['antimention']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler 