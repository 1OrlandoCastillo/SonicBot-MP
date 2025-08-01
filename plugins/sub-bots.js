import ws from 'ws'
import { format } from 'util'
import { join } from 'path'
import fs from 'fs'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()
  let totalGroups = 0

  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

 
  if (global.conn.chats) {
    for (let [jid, chat] of Object.entries(global.conn.chats)) {
      if (chat.id.endsWith('@g.us')) {
        totalGroups++
      }
    }
  }

 
  global.conns.forEach((subConn) => {
    if (subConn.user && subConn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(subConn.user.jid, subConn)
      
   
      if (subConn.chats) {
        for (let [jid, chat] of Object.entries(subConn.chats)) {
          if (chat.id.endsWith('@g.us')) {
            totalGroups++
          }
        }
      }
    }
  })

  let uptime = process.uptime() * 1000
  let formatUptime = clockString(uptime)
  let totalSubBots = uniqueUsers.size

  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')
  let nombreBot = global.namebot || 'KIYOMI MD'
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.error('Error al leer el archivo de configuración:', err)
    }
  }


  const totalBots = totalSubBots + 1
  const memoryUsage = process.memoryUsage()
  const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)

  let txt = `╭─「 ✦ 𓆩⚡𓆪 ɪɴғᴏ ᴅᴇ ʙᴏᴛs ✦ 」─╮\n`
  txt += `│\n`
  txt += `╰➺ ✧ *Bot Actual:* ${nombreBot}\n`
  txt += `╰➺ ✧ *Número:* +${botActual}\n`
  txt += `╰➺ ✧ *Tiempo Activo:* ${formatUptime}\n`
  txt += `╰➺ ✧ *Memoria:* ${memoryMB} MB\n`
  txt += `│\n`
  txt += `╰────────────────╯\n\n`
  
  txt += `╭─「 ✦ 𓆩📊𓆪 ᴇsᴛᴀᴅɪsᴛɪᴄᴀs ✦ 」─╮\n`
  txt += `│\n`
  txt += `╰➺ ✧ *Total de Bots:* ${totalBots}\n`
  txt += `╰➺ ✧ *Bot Principal:* 1\n`
  txt += `╰➺ ✧ *Sub-Bots Activos:* ${totalSubBots}\n`
  txt += `╰➺ ✧ *Total de Grupos:* ${totalGroups}\n`
  txt += `│\n`
  txt += `╰────────────────╯\n\n`

  txt += `╭─「 ✦ 𓆩👑𓆪 ʙᴏᴛ ᴘʀɪɴᴄɪᴘᴀʟ ✦ 」─╮\n`
  txt += `│\n`
  txt += `╰➺ ✧ *Número:* +${global.conn.user.jid.split('@')[0]}\n`
  txt += `╰➺ ✧ *Estado:* Conectado\n`
  txt += `╰➺ ✧ *Grupos:* ${Object.values(global.conn.chats || {}).filter(chat => chat.id.endsWith('@g.us')).length}\n`
  txt += `│\n`
  txt += `╰────────────────╯\n\n`
  
  if (totalSubBots > 0) {
    txt += `╭─「 ✦ 𓆩🤖𓆪 sᴜʙ-ʙᴏᴛs ᴀᴄᴛɪᴠᴏs ✦ 」─╮\n`
    txt += `│\n`
    
    let i = 1
    for (let [jid, subConn] of uniqueUsers) {
      const subBotNumber = jid.split('@')[0]
      const subBotGroups = Object.values(subConn.chats || {}).filter(chat => chat.id.endsWith('@g.us')).length
      
      txt += `╰➺ ✧ *${i}. +${subBotNumber}*\n`
      txt += `│   • Grupos: ${subBotGroups}\n`
      txt += `│   • Estado: Activo\n`
      if (i < totalSubBots) txt += `│\n`
      i++
    }
    
    txt += `│\n`
    txt += `╰────────────────╯\n\n`
  } else {
    txt += `╭─「 ✦ 𓆩❌𓆪 sᴜʙ-ʙᴏᴛs ✦ 」─╮\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Sin sub-bots activos*\n`
    txt += `╰➺ ✧ *Usa #qr o #code para crear uno*\n`
    txt += `│\n`
    txt += `╰────────────────╯\n\n`
  }

  txt += `╭─「 ✦ 𓆩📈𓆪 ʀᴇsᴜᴍᴇɴ ✦ 」─╮\n`
  txt += `│\n`
  txt += `╰➺ ✧ *Bots Totales:* ${totalBots}\n`
  txt += `╰➺ ✧ *Grupos Totales:* ${totalGroups}\n`
  txt += `│\n`
  txt += `╰────────────────╯\n`
  txt += `\n> LOVELLOUD Official`

  let imgBot = './storage/img/menu3.jpg'
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.img) imgBot = config.img
    } catch (err) {
      console.error('Error al leer el archivo de configuración:', err)
    }
  }

  await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', txt, m, null, { mentions: [] })
}

handler.command = ['listjadibot', 'bots', 'subbots', 'listbots']
handler.help = ['#bots • #subbots • #listbots\n→ Ver información detallada de todos los bots']
handler.tags = ['subbots']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}