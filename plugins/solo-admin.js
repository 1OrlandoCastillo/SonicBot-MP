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
    
    if (!global.db.data.soloAdmin) global.db.data.soloAdmin = {}
    
    if (action === 'on') {
      global.db.data.soloAdmin[m.chat] = true
      
      let txt = `╭─「 ✦ 🔐 sᴏʟᴏ-ᴀᴅᴍɪɴs ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Activado\n`
      txt += `╰➺ ✧ *Modo:* Solo Administradores\n`
      txt += `╰➺ ✧ *Restricción:* Comandos bloqueados\n`
      txt += `╰➺ ✧ *Acceso:* Admins del Grupo + Owners\n`
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
      global.db.data.soloAdmin[m.chat] = false
      
      let txt = `╭─「 ✦ 🔓 sᴏʟᴏ-ᴀᴅᴍɪɴs ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Desactivado\n`
      txt += `╰➺ ✧ *Modo:* Todos los Miembros\n`
      txt += `╰➺ ✧ *Acceso:* Libre para Todos\n`
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
      
    } else {
      let txt = `╭─「 ✦ 🔐 sᴏʟᴏ-ᴀᴅᴍɪɴs ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Uso:* ${usedPrefix + command} on/off\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Ejemplo:*\n`
      txt += `╰➺ ✧ ${usedPrefix + command} on\n`
      txt += `╰➺ ✧ ${usedPrefix + command} off\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Descripción:*\n`
      txt += `╰➺ ✧ Restringe el bot solo a admins y owners\n`
      txt += `╰➺ ✧ del grupo cuando está activado\n`
      txt += `\n> LOVELLOUD Official`
      
      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al procesar el comando.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['soladmin', 'soloadmin', 'onlyadmin', 'adminonly']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler