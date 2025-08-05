import fs from 'fs'
import path, { join } from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
  const user = m.sender
  const data = global.db.data.users[user]

  const texto = `
✿ Perfil de ${data.name || await conn.getName(user)}

✿ Nombre: ${data.name || 'No establecido'}
✿ Género: ${data.genre || 'No establecido'}
✿ Cumpleaños: ${data.birth || 'No registrado'}
✿ Descripción: ${data.desc || 'Sin descripción'}
✿ Favorito: ${data.favourite || 'No establecido'}
✿ Nivel: ${data.level || 0}
✿ Coins: ${data.coins || 0}
✿ Experiencia: ${data.exp || 0}

❒ ID: ${user}
❒ Tipo: Usuario
❒ Registrado: ${data.registered ? 'Sí' : 'No'}
  `.trim()

  const botNumber = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botNumber, 'config.json')

  let imgBot = './storage/img/menu3.jpg'
  let hasUserPP = false
  
 
  try {
    const pp = await conn.profilePictureUrl(user, 'image')
    if (pp) {
      imgBot = pp
      hasUserPP = true
    }
  } catch (e) {
    
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.img) imgBot = config.img
      } catch {}
    }
  }

 
  if (hasUserPP) {
    await conn.sendMessage(m.chat, {
      image: { url: imgBot },
      caption: texto,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [data.partner || user]
      }
    }, { quoted: m })
  } else {
    
    await conn.sendFile(m.chat, imgBot, 'profile.jpg', texto, m, null, rcanal, { mentions: [data.partner || user] })
  }
}
handler.help = ['#profile • #perfil\n→ Revisa tu perfil completo con estadísticas y logros']
handler.tags = ['perfiles']
handler.command = ['profile', 'perfil']
export default handler
