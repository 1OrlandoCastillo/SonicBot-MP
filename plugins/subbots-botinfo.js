import fs from 'fs'
import { join } from 'path'
import { sizeFormatter } from 'human-readable'
import { performance } from 'perf_hooks'
import ws from 'ws'

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn, usedPrefix }) => {
  let sockets = new Map()

  global.conns.forEach(sock => {
    if (sock.user && sock.ws?.socket?.readyState !== ws.CLOSED) {
      sockets.set(sock.user.jid, sock)
    }
  })

  let totalf = Object.values(global.plugins).filter(v => v.help && v.tags).length

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

  let nombreBot = global.namebot || 'KIYOMI MD'
  let moneyName = 'Gats'
  let imgBot = './storage/img/menu2.jpg'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
      if (config.moneyName) moneyName = config.moneyName
      if (config.img) imgBot = config.img
    } catch {}
  }

  const tipo = botActual === '+51958333972'.replace(/\D/g, '')
    ? 'Principal Bot'
    : 'Sub Bot'

  let t1 = performance.now()
  let latensi = performance.now() - t1

 
  let botUptime = 0
  if (conn.startTime) {
    botUptime = Date.now() - conn.startTime
  }
  let botFormatUptime = clockString(botUptime)

  
  let subBotsActivos = 0
  if (global.conns && Array.isArray(global.conns)) {
    subBotsActivos = global.conns.filter(subConn => 
      subConn.user && 
      subConn.ws?.socket?.readyState !== ws.CLOSED
    ).length
  }

  
  let ownersText = ''
  if (global.owner && Array.isArray(global.owner)) {
    ownersText = global.owner.map(([number, name]) => `+${number} (${name})`).join('\n')
  }

 
  const botNumber = conn.user?.jid?.split('@')[0] || 'Desconocido'

  let txt = `╭─「 ✦ 𓆩🤖𓆪 ɪɴғᴏ ᴅᴇʟ ʙᴏᴛ ✦ 」─╮\n`
  txt += `│\n`
  txt += `╰➺ ✧ *Nombre:* ${nombreBot}\n`
  txt += `╰➺ ✧ *Número:* +${botNumber}\n`
  txt += `╰➺ ✧ *Tipo:* ${tipo}\n`
  txt += `╰➺ ✧ *Librería:* Baileys MD\n`
  txt += `╰➺ ✧ *Tiempo Activo:* ${botFormatUptime}\n`
  txt += `╰➺ ✧ *Sub-Bots Activos:* ${subBotsActivos}\n`
  txt += `╰➺ ✧ *Plugins:* ${totalf}\n`
  txt += `╰➺ ✧ *Prefijo:* ${usedPrefix}\n`
  txt += `╰➺ ✧ *Speed:* ${latensi.toFixed(4)}ms\n`
  txt += `│\n`
  txt += `╰────────────────╯\n\n`

  if (ownersText) {
    txt += `╭─「 ✦ 𓆩👑𓆪 ᴄʀᴇᴀᴅᴏʀᴇs ✦ 」─╮\n`
    txt += `│\n`
    txt += `${ownersText.split('\n').map(owner => `╰➺ ✧ *${owner}*`).join('\n')}\n`
    txt += `│\n`
    txt += `╰────────────────╯\n\n`
  }

  txt += `> LOVELLOUD Official`

  await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', txt, m, null, { 
    contextInfo: {
      ...rcanal.contextInfo
    }
  })
}

handler.help = ['#botinfo • #infobot\n→ Obtener información única y original del bot']
handler.tags = ['subbots']
handler.command = ['info', 'infobot']

export default handler

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, ' D ', h, ' H ', m, ' M ', s, ' S'].map(v => v.toString().padStart(2, 0)).join('')
}
