import { xpRange } from '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender

  let user = global.db.data.users[who]

  let imgBot = './storage/img/menu3.jpg'
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.img) imgBot = config.img
    } catch (err) {}
  }

  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => imgBot)

  let { exp, limit, name, registered, age, level } = global.db.data.users[who]
  let { min, xp } = xpRange(user.level, global.multiplier)

  let prem = global.prems.includes(who.split`@`[0])

  let img = await (await fetch(`${pp}`)).buffer()
  let txt = `🍥 XP :: ${exp} (${user.exp - min}/${xp})\n`
  await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i

export default handler
