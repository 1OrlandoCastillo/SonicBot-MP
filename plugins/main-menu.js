import fs from 'fs';
import { promises as fsp } from 'fs';
// fs.readFileSync(...) → para síncrona
// fsp.readFile(...) → para async/await
import { join } from 'path'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: 'ᗝ̵      ִ       ꯭ ꯭s꯭u꯭bb꯭o꯭t꯭s ꯭ ꯭        ֹ     𓋲',
  search: 'ᗝ̵      ִ       ꯭ ꯭s꯭ea꯭rc꯭h꯭s ꯭ ꯭        ֹ     𓋲',
  downloader: 'ᗝ̵      ִ       ꯭ ꯭do꯭w꯭nl꯭o꯭ae꯭r ꯭ ꯭        ֹ     𓋲',
  tools: 'ᗝ̵      ִ       ꯭ ꯭to꯭ol꯭s꯭ ꯭ ꯭        ֹ     𓋲',
  sticker: 'ᗝ̵      ִ       ꯭ ꯭s꯭ti꯭ck꯭e꯭rs꯭ ꯭ ꯭        ֹ     𓋲',
  owner: 'ᗝ̵      ִ       ꯭ ꯭o꯭w꯭ne꯭r꯭ ꯭ ꯭        ֹ     𓋲',
}

const defaultMenu = {
  before: `
Hola soy %botname

Tiempo Activa :: %uptime

> Registered users :: 958261

Puedes usar .setbotname para cambiar en nombre y .setlogo para cambiar la foto

%readmore`.trimStart(),

  header: '%category',
  body: '𔖲𔖰𔖭  𔘓꯭፝𔘓  📓 ᩨ ︳%cmd %islimit %isPremium\n',
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
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium
    }))

    let nombreBot = global.namebot || 'Anya Forger'
    let logoBot = './storage/img/menu3.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.logo) logoBot = config.logo
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
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

    const isURL = typeof logoBot === 'string' && /^https?:\/\//i.test(logoBot)
    const imageContent = isURL ? { image: { url: logoBot } } : { image: fs.readFileSync(logoBot) }

    const rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: idcanal,
          serverMessageId: 100,
          newsletterName: namecanal
        }
      }
    }

    await conn.sendMessage(m.chat, {
      ...imageContent,
      caption: text.trim(),
      mentionedJid: conn.parseMention(text),
      ...rcanal
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    throw e
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler

// Utilidades
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

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
