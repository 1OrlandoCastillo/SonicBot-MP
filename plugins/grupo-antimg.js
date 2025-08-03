let handler = async (m, { conn, usedPrefix, command, args, text, isOwner, isAdmin }) => {
  if (!isOwner && !isAdmin && !m.fromMe) {
    return m.reply('*[❗] Solo los dueños, administradores y el bot pueden usar este comando.*')
  }

  try {
    const action = args[0]?.toLowerCase()
    
    if (!action || !['on', 'off'].includes(action)) {
      return m.reply(`*[❗] Uso incorrecto del comando.*\n\n> *Opciones disponibles:*\n• ${usedPrefix + command} on - Activar anti-imagen en este grupo\n• ${usedPrefix + command} off - Desactivar anti-imagen en este grupo`)
    }

    if (!m.isGroup) {
      return m.reply('*[❗] Este comando solo funciona en grupos.*')
    }

   
    if (!global.db.data.antiImg) {
      global.db.data.antiImg = {}
    }
    
    if (action === 'on') {
      global.db.data.antiImg[m.chat] = true
      await global.db.write()
      
      const message = `╭─「 ✦ 𓆩🖼️𓆪 ᴀɴᴛɪ-ɪᴍᴀɢᴇɴ ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n\n╰➺ ✧ *Grupo:* ${await conn.getName(m.chat)}\n╰➺ ✧ *Estado:* 🟢 *ACTIVADO*\n╰➺ ✧ *Por:* @${m.sender.split('@')[0]}\n\n╰➺ ✧ *Función:* Eliminará automáticamente todas las imágenes\n\n> LOVELLOUD Official`
      
      await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })
      
      console.log(`✅ Anti-imagen activado en grupo: ${m.chat} por ${m.sender}`)
      
    } else if (action === 'off') {
      global.db.data.antiImg[m.chat] = false
      await global.db.write()
      
      const message = `╭─「 ✦ 𓆩🖼️𓆪 ᴀɴᴛɪ-ɪᴍᴀɢᴇɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮\n\n╰➺ ✧ *Grupo:* ${await conn.getName(m.chat)}\n╰➺ ✧ *Estado:* 🔴 *DESACTIVADO*\n╰➺ ✧ *Por:* @${m.sender.split('@')[0]}\n\n╰➺ ✧ *Función:* Ya no eliminará imágenes automáticamente\n\n> LOVELLOUD Official`
      
      await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })
      
      console.log(`❌ Anti-imagen desactivado en grupo: ${m.chat} por ${m.sender}`)
    }

  } catch (e) {
    console.error('Error en comando antimg:', e)
    m.reply('❌ Hubo un error al procesar el comando.')
  }
}


handler.command = ['anti-img']

export default handler 