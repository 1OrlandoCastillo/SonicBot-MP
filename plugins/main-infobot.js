import { arch, cpus as _cpus, freemem, platform, release, totalmem } from 'os'
import fs from 'fs'
import { sizeFormatter } from 'human-readable'
import speed from 'performance-now'
import { join } from 'path'
import ws from 'ws'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn, usedPrefix }) => {
  let uniqueUsers = new Map()

  global.conns.forEach((conn) => {
    if (conn.user && conn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(conn.user.jid, conn)
    }
  })

  let users = [...uniqueUsers.values()]
  let totalf = Object.values(global.plugins).filter(v => v.help && v.tags).length
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))

  let _muptime
  if (process.send) {
    process.send('uptime')
    _muptime = await new Promise(resolve => {
      process.once('message', resolve)
      setTimeout(resolve, 1000)
    }) * 1000
  }
  let muptime = clockString(_muptime)

  const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'
  let moneyName = 'Money'
  let imgBot = './storage/img/menu3.jpg'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
      if (config.moneyName) moneyName = config.moneyName
      if (config.img) imgBot = config.img
    } catch (err) { }
  }

  const tipo = botActual === '+5363172635'.replace(/\D/g, '')
    ? 'Principal Bot'
    : 'Prem Bot'

  let timestamp = speed()
  let latensi = speed() - timestamp

  let txt = `⟡ Nombre: ${nombreBot}\n`
  txt += `❁ Moneda: ${moneyName}\n\n`
  txt += `♡ Prefijo: ${usedPrefix}\n`
  txt += `✧ Plugins: ${totalf}\n`
  txt += `❀ Speed: ${latensi.toFixed(4)}\n\n`
  txt += `✩ Host: Akirax\n`
  txt += `✦ Conexión: Akirax_1\n`
  txt += `♢ Tipo: ${tipo}\n`
  txt += `\n> LOVELLOUD Official`

  await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', txt, m, null, rcanal)
}

handler.help = ['botinfo • infobot\n→ Obtener información única y original del bot']
handler.tags = ['subbots']
handler.command = ['botinfo', 'infobot']

export default handler

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, ' D ', h, ' H ', m, ' M ', s, ' S'].map(v => v.toString().padStart(2, 0)).join('')
}
