import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  subbots: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Sub-bots* 𖤓\n\n✧ Comandos para crear, enlazar y gestionar tu propio bot personal.\n\n',
  economía: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Economía* 𖤓\n\n✧ Comandos para trabajar, jugar y hacer dinero con estilo.\n\n',
  perfiles: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Perfiles* 𖤓\n\n✧ Comandos para ver, personalizar y destacar tu perfil.\n\n',
  busqueda: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Busquedas* 𖤓\n\n✧ Comandos para buscar contenido.\n\n',
  descargas: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Descargas* 𖤓\n\n✧ Comandos para obtener música, videos y más desde distintas fuentes.\n\n',
  grupos: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Administración* 𖤓\n\n✧ Comandos exclusivos para gestionar y moderar grupos.\n\n',
  stickers: '➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Stickers* 𖤓\n\n✧ Comandos para crear, editar y divertirte con tus stickers.\n\n',
}

const defaultMenu = {
  before: `
Hola! soy %botname  
(%tipo)

Aqui tienes la lista de comandos

╭───〔 ✦ 𓆩💎𓆪  ᴄᴀɴᴀʟᴇs ᴏғɪᴄɪᴀʟᴇs ✦ 〕───╮
│  ꒷ꕤ  Accede aquí:
│
│  ➺ https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M
│
│  ➺ https://whatsapp.com/channel/0029Vb5Vinf72WTo11c5hJ3O
│
╰──────────────────────────────╯
%readmore`.trimStart(),

  header: '%category',
  body: '𝆬✦%cmd\n',
  footer: '',
  after: '',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

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
      prefix: 'customPrefix' in plugin
    }))

    let nombreBot = global.namebot || 'Anya Forger'
    let imgBot = './storage/img/menu3.jpg'
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    const configPath = join('./Serbot', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.img) imgBot = config.img
      } catch {}
    }

    const tipo = botActual === '+51958303585'.replace(/\D/g, '') ? 'Principal Bot' : 'Sub Bot'

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
      tipo,
      readmore: readMore,
      greeting,
      uptime: clockString(process.uptime() * 1000),
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', text.trim(), m, null, rcanal)
  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    throw e
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

const hour = new Date().getHours()
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
const greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')
