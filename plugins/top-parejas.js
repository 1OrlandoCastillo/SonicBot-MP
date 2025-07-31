let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '《✧》Este comando solo puede ser usado en grupos.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })

  try {
   
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants || []
    
    
    const allParticipants = participants.filter(p => p.id !== conn.user.jid)
    
    if (allParticipants.length < 2) {
      return conn.sendMessage(m.chat, {
        text: '《✧》Se necesitan al menos 2 usuarios para crear parejas.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    
    const pairs = []
    const maxPairs = Math.min(10, Math.floor(allParticipants.length / 2))
    const shuffledParticipants = [...allParticipants].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < maxPairs; i++) {
      const index1 = i * 2
      const index2 = index1 + 1
      
      if (index2 < shuffledParticipants.length) {
        pairs.push({
          user1: shuffledParticipants[index1],
          user2: shuffledParticipants[index2]
        })
      }
    }
    
    if (pairs.length === 0) {
      return conn.sendMessage(m.chat, {
        text: '《✧》No se pudieron crear parejas con los usuarios disponibles.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    
    
    let txt = `╭─「 ✦ 𓆩💕𓆪 ᴛᴏᴘ ᴘᴀʀᴇᴊᴀs ᴅᴇʟ ɢʀᴜᴘᴏ ✦ 」─╮\n`
    txt += `│\n`
    
   
    pairs.forEach((pair, index) => {
      const position = index + 1
      const emoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '💕'
      txt += `╰➺ ${emoji} *${position}.* @${pair.user1.id.split('@')[0]} 💕 @${pair.user2.id.split('@')[0]}\n`
    })
    
    txt += `│\n`
    txt += `╰────────────────╯\n`
    txt += `\n> LOVELLOUD Official`
    
    
    const mentionedJid = pairs.flatMap(pair => [pair.user1.id, pair.user2.id])
    
    return conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: mentionedJid
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en top parejas:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al generar el top de parejas del grupo.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#topparejas']
handler.tags = ['fun', 'grupos']
handler.command = /^(topparejas|toppareja|parejas|parejatop)$/i
handler.group = true

export default handler 