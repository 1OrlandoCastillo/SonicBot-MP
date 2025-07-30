import ws from 'ws'
import { format } from 'util'
import { join } from 'path'
import fs from 'fs'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

  global.conns.forEach((conn) => {
    if (conn.user && conn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(conn.user.jid, conn)
    }
  })

  let uptime = process.uptime() * 1000
  let formatUptime = clockString(uptime)

  let totalUsers = uniqueUsers.size
  let txt = `¿Cómo le va su día? `
  txt += '\n\n'
  txt += 'Lista de activ@s'
  txt += '\n\n'
  txt += '🪷 : Principales :: 1\n'
  txt += `🍥 : Sub-Bots :: ${totalUsers || 0}\n`
  txt += '\n'
  txt += '> Anya Forger'

  let imgBot = './storage/img/menu3.jpg'

  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')
  
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

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['subbots']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}