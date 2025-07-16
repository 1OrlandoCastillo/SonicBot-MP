import fs from 'fs'
import { promises as fsp } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: 'ㅤㅤㅤㅤ꒰ 🪷 ꒱ㅤㅤSubbots',
  search: 'ㅤㅤㅤㅤ꒰ 🍨 ꒱ㅤㅤSearchs',
  downloader: 'ㅤㅤㅤㅤ꒰ 🍓 ꒱ㅤㅤDownloaders',
  group: 'ㅤㅤㅤㅤ꒰ 🍥 ꒱ㅤㅤGroups',
  tools: 'ㅤㅤㅤㅤ꒰ 🩰 ꒱ㅤㅤTools',
  sticker: 'ㅤㅤㅤㅤ꒰ 🌸 ꒱ㅤㅤStickers',
  owner: 'ㅤㅤㅤㅤ꒰ 🍈 ꒱ㅤㅤOwner',
}

const defaultMenu = {
  before: `
Hola soy %botname

¿Como le va su día?

🪷 : Tiempo :: %uptime
📚 : Baileys :: Multi Device
💮 : Modo :: Privado

Puedes usar:
.setbotname para cambiar el nombre 
.setbotimg para cambiar la foto

%readmore`.trimStart(),

  header: '%category',
  body: '𝆬🍄ㅤ◌ㅤ%cmd %islimit %isPremium\n',
  footer: '',
  after: '',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender] || {}
    const { exp = 0, limit = 0, level = 0 } = user
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const ase = new Date()
    let hour = ase.getHours()
    const greetingMap = {
      0: 'una linda noche 🌙',
      1: 'una linda noche 💤',
      2: 'una linda noche 🦉',
      3: 'una linda mañana ✨',
      4: 'una linda mañana 💫',
      5: 'una linda mañana 🌅',
      6: 'una linda mañana 🌄',
      7: 'una linda mañana 🌅',
      8: 'una linda mañana 💫',
      9: 'una linda mañana ✨',
      10: 'un lindo día 🌞',
      11: 'un lindo día 🌨',
      12: 'un lindo día ❄',
      13: 'un lindo día 🌤',
      14: 'una linda tarde 🌇',
      15: 'una linda tarde 🥀',
      16: 'una linda tarde 🌹',
      17: 'una linda tarde 🌆',
      18: 'una linda noche 🌙',
      19: 'una linda noche 🌃',
      20: 'una linda noche 🌌',
      21: 'una linda noche 🌃',
      22: 'una linda noche 🌙',
      23: 'una linda noche 🌃',
    }

    var greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')

    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const week = d.toLocaleDateString(locale, { weekday: 'long' })
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })

    const totalreg = Object.keys(global.db.data.users).length
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    const help = Object.values(global.plugins).filter(p => !p.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium
    }))

    let nombreBot = global.namebot || 'Anya Forger'
    let imgBot = './storage/img/menu3.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./Serbot', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.img) imgBot = config.img
      } catch { }
    }

    const menuConfig = conn.menu || defaultMenu
    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu => {
            return menu.help.map(helpText => {
              return menuConfig.body
                .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                .trim()
            }).join('\n')
          }).join('\n'),
          menuConfig.footer
        ].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      week,
      date,
      time,
      totalreg,
      rtotalreg,
      readmore: readMore,
      greeting,
      uptime: clockString(process.uptime() * 1000),
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', text.trim(), m rcanal)

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    console.error(e)
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
