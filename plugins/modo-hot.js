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
    
    if (!global.db.data.modoHot) global.db.data.modoHot = {}
    
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
      
      global.db.data.modoHot[m.chat] = true
      
      let txt = `╭─「 ✦ 🔥 ᴍᴏᴅᴏ ʜᴏᴛ ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Activado 🔥\n`
      txt += `╰➺ ✧ *Personalidad:* Chica Hot & Seductora\n`
      txt += `╰➺ ✧ *Modo:* Coqueta y Atrevida 😏\n`
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
      global.db.data.modoHot[m.chat] = false
      
 
      try {
        const { clearMemory } = await import('../lib/geminiAPI.js')
        clearMemory(m.chat)
      } catch (e) {
        console.error('Error limpiando memoria:', e)
      }
      
      let txt = `╭─「 ✦ 😴 ᴍᴏᴅᴏ ʜᴏᴛ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Estado:* Desactivado\n`
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
      // Limpiar solo la memoria
      try {
        const { clearMemory } = await import('../lib/geminiAPI.js')
        clearMemory(m.chat)
        
        let txt = `╭─「 ✦ 🧠 ᴍᴇᴍᴏʀɪᴀ ʟɪᴍᴘɪᴀᴅᴀ ✦ 」─╮\n`
        txt += `│\n`
        txt += `╰➺ ✧ *Acción:* Memoria limpiada\n`
        txt += `╰➺ ✧ *Estado Hot:* Sigue activado 🔥\n`
        txt += `╰➺ ✧ *Conversación:* Reiniciada\n`
        txt += `╰➺ ✧ *Mensajes:* 0/20 recordados\n`
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
      let txt = `╭─「 ✦ 🔥 ᴍᴏᴅᴏ ʜᴏᴛ ✦ 」─╮\n`
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
      txt += `╰➺ ✧ de chica hot, seductora y coqueta\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Nota:* No compatible con modo IA\n`
      txt += `╰➺ ✧ Desactiva modo IA antes de usar\n`
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

handler.command = ['modohot', 'hotmode', 'modoSexy', 'hotai']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler