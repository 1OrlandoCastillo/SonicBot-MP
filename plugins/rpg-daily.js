let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let user = global.db.data.users[m.sender]
    if (!user) global.db.data.users[m.sender] = {}
    
    let coins = user.coins || 0
    
   
    const cooldown = 24 * 60 * 60 * 1000 
    const lastDaily = user.lastDaily || 0
    const timeLeft = cooldown - (Date.now() - lastDaily)
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / 3600000)
      const minutes = Math.floor((timeLeft % 3600000) / 60000)
      const seconds = Math.floor((timeLeft % 60000) / 1000)
      
     
      const nextClaim = new Date(Date.now() + timeLeft)
      const nextDate = nextClaim.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
                       
        const nextStreak = (user.dailyStreak || 0) + 1
        
                return conn.sendMessage(m.chat, {
          text: `《✧》Ya reclamaste tu daily hoy.\n\n*⏱️ Tiempo restante:* ${hours} hora${hours !== 1 ? 's' : ''}, ${minutes} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}\n\n*🎯 Tu próxima racha:* ${nextStreak} 🔥`,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
    }
    
    
    let streak = user.dailyStreak || 0
    let premio = 0
    let mensaje = ''
    
   
    const lastClaim = user.lastDaily || 0
    const timeSinceLastClaim = Date.now() - lastClaim
    const oneDay = 24 * 60 * 60 * 1000
    
    if (lastClaim > 0 && timeSinceLastClaim > oneDay + 60000) { 
     
      streak = 0
      mensaje = '❌ *¡Perdiste tu racha!* No reclamaste a tiempo'
    }
    
    
    if (streak === 0) {
    
      premio = 50
      streak = 1
      if (lastClaim === 0) {
        mensaje = '🎉 *¡Primer daily!* Bienvenido al sistema de rachas'
      }
    } else {
      
      streak++
      premio = 50 + (streak - 1) * 100
      mensaje = `🔥 *¡Racha de ${streak} días!* Sigue así`
    }
    
  
    global.db.data.users[m.sender].coins = coins + premio
    global.db.data.users[m.sender].dailyStreak = streak
    global.db.data.users[m.sender].lastDaily = Date.now()
    
    
    const nextClaim = new Date(Date.now() + cooldown)
    const nextDate = nextClaim.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
 
    const nextPremio = 50 + streak * 100
    
        
     
          let txt = `╭─「 ✦ 🎁 ᴅᴀɪʟʏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Racha:* ${streak} 🔥\n`
    txt += `╰➺ ✧ *Premio:* +${premio} coins\n`
    txt += `╰➺ ✧ *Total:* ${coins + premio} coins\n`
    txt += `│\n`
    txt += `╰➺ ✧ ${mensaje}\n`
    txt += `╰➺ ✧ *Próximo premio:* ${nextPremio} coins\n`
    txt += `╰➺ ✧ *Próximo claim:* ${nextDate}\n`
    txt += `\n> LOVELLOUD Official`
    
    return conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en daily:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al reclamar el daily.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#daily • #day\n→ Reclama coins diarios y mantén tu racha']
handler.tags = ['juegos', 'economía']
handler.command = ['daily', 'day', 'diario']

export default handler 