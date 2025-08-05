let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let user = global.db.data.users[m.sender]
    if (!user) global.db.data.users[m.sender] = {}
    
   
    const newName = args.join(' ').trim()
    
    if (!newName) {
      return conn.sendMessage(m.chat, {
        text: `《✧》Debes especificar un nuevo nombre.\n\n*Ejemplo:* ${usedPrefix}setname Juan Pérez`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
       
     if (newName.length < 2) {
       return conn.sendMessage(m.chat, {
         text: '《✧》El nombre debe tener al menos 2 caracteres.',
         contextInfo: {
           ...rcanal.contextInfo
         }
       }, { quoted: m })
     }
     
           if (newName.length > 14) {
        return conn.sendMessage(m.chat, {
          text: '《✧》El nombre no puede tener más de 14 caracteres.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
     
     
      const invalidChars = /[^\x00-\x7F]/
      const hasStylizedFont = /[ａ-ｚＡ-Ｚ０-９]/.test(newName) 
      
      if (invalidChars.test(newName) || hasStylizedFont) {
        return conn.sendMessage(m.chat, {
          text: '《✧》El nombre no puede contener fuentes estilizadas o caracteres especiales.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
     
     const existingUser = Object.entries(global.db.data.users).find(([jid, user]) => {
       return jid !== m.sender && user.name && user.name.toLowerCase() === newName.toLowerCase()
     })
     
     if (existingUser) {
       return conn.sendMessage(m.chat, {
         text: `《✧》El nombre "${newName}" ya está en uso por otro usuario.`,
         contextInfo: {
           ...rcanal.contextInfo
         }
       }, { quoted: m })
     }
    
   
    const oldName = user.name || 'Sin nombre'
    
    
    global.db.data.users[m.sender].name = newName
    
    
    let txt = `╭─「 ✦ ✏️ ᴄᴀᴍʙɪᴏ ᴅᴇ ɴᴏᴍʙʀᴇ ✦ 」─╮\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Anterior:* ${oldName}\n`
    txt += `╰➺ ✧ *Nuevo:* ${newName}\n`
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
    console.error('Error en setname:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al cambiar el nombre.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#setname <nuevo nombre>\n→ Cambia tu nombre en el perfil']
handler.tags = ['perfiles']
handler.command = ['setname', 'cambiarnombre', 'nombre']

export default handler 