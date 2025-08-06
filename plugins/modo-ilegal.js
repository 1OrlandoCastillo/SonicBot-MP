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
    
    if (!global.db.data.modoIlegal) global.db.data.modoIlegal = {}
    
    if (action === 'on') {

      if (global.db.data.modoIA && global.db.data.modoIA[m.chat] === true) {
        let txt = `╭─「 ✦ ⚠️ ᴄᴏɴғʟɪᴄᴛᴏ ᴅᴇ ᴍᴏᴅᴏs ⚠️ ✦ 」─╮\n`
        txt += `│\n`
        txt += `╰➺ ✧ *Error:* Modo IA está activo\n`
        txt += `╰➺ ✧ *Solución:* Desactiva modo IA primero\n`
        txt += `╰➺ ✧ *Comando:* .modoia off\n`
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
      }
      
      if (global.db.data.modoHot && global.db.data.modoHot[m.chat] === true) {
        let txt = `╭─「 ✦ ⚠️ ᴄᴏɴғʟɪᴄᴛᴏ ᴅᴇ ᴍᴏᴅᴏs ⚠️ ✦ 」─╮\n`
        txt += `│\n`
        txt += `╰➺ ✧ *Error:* Modo Hot está activo\n`
        txt += `╰➺ ✧ *Solución:* Desactiva modo hot primero\n`
        txt += `╰➺ ✧ *Comando:* .modohot off\n`
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
      }
      
      global.db.data.modoIlegal[m.chat] = true
      
      let txt = `╭─「 ✦ 🚫 ᴍᴏᴅᴏ ɪʟᴇɢᴀʟ ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Activado 🚫\n`
      txt += `╰➺ ✧ *Personalidad:* Completamente Ilegal\n`
      txt += `╰➺ ✧ *Modo:* Respuestas Prohibidas ⚠️\n`
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
      global.db.data.modoIlegal[m.chat] = false
      
      
      try {
        const { clearMemory } = await import('../lib/geminiAPI.js')
        clearMemory(m.chat)
      } catch (e) {
        console.error('Error limpiando memoria:', e)
      }
      
      let txt = `╭─「 ✦ ✅ ᴍᴏᴅᴏ ɪʟᴇɢᴀʟ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Desactivado\n`
      txt += `╰➺ ✧ *Modo:* Normal\n`
      txt += `╰➺ ✧ *Comportamiento:* Legal\n`
      txt += `╰➺ ✧ *Memoria:* Limpiada\n`
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
      
    } else if (action === 'clear' || action === 'limpiar') {

      try {
        const { clearMemory } = await import('../lib/geminiAPI.js')
        clearMemory(m.chat)
        
        let txt = `╭─「 ✦ 🧠 ᴍᴇᴍᴏʀɪᴀ ʟɪᴍᴘɪᴀᴅᴀ ✦ 」─╮\n`
        txt += `│\n`
        txt += `╰➺ ✧ *Acción:* Memoria limpiada\n`
        txt += `╰➺ ✧ *Estado Ilegal:* Sigue activado 🚫\n`
        txt += `╰➺ ✧ *Conversación:* Reiniciada\n`
        txt += `╰➺ ✧ *Mensajes:* 0/20 recordados\n`
        txt += `│\n`
        txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
        txt += `\n> LOVELLOUD Official 🚫`
        
        return conn.sendMessage(m.chat, {
          text: txt,
          contextInfo: {
            ...rcanal.contextInfo,
            mentionedJid: [m.sender]
          }
        }, { quoted: m })
        
      } catch (e) {
        console.error('Error limpiando memoria:', e)
        return conn.sendMessage(m.chat, {
          text: '《✧》Error al limpiar la memoria.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
    } else {
      let txt = `╭─「 ✦ 🚫 ᴍᴏᴅᴏ ɪʟᴇɢᴀʟ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Uso:* ${usedPrefix + command} on/off/clear\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Ejemplos:*\n`
      txt += `╰➺ ✧ ${usedPrefix + command} on\n`
      txt += `╰➺ ✧ ${usedPrefix + command} off\n`
      txt += `╰➺ ✧ ${usedPrefix + command} clear\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Descripción:*\n`
      txt += `╰➺ ✧ Activa una IA con personalidad\n`
      txt += `╰➺ ✧ completamente ilegal y prohibida\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Nota:* No compatible con otros modos\n`
      txt += `╰➺ ✧ Desactiva otros modos antes de usar\n`
      txt += `\n> LOVELLOUD Official 🚫`
      
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

handler.command = ['modoilegal', 'ilegalmode', 'modoIlegal', 'ilegal']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler 