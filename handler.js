import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(() => resolve(), ms))

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return

  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0

    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') global.db.data.users[m.sender] = {}

    if (user) {
      if (!isNumber(user.exp)) user.exp = 0
      if (!isNumber(user.joincount)) user.joincount = 1
      if (!isNumber(user.diamond)) user.diamond = 3
      if (!isNumber(user.lastadventure)) user.lastadventure = 0
      if (!isNumber(user.lastclaim)) user.lastclaim = 0
      if (!isNumber(user.health)) user.health = 100
      if (!isNumber(user.crime)) user.crime = 0
      if (!isNumber(user.lastcofre)) user.lastcofre = 0
      if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0
      if (!isNumber(user.lastpago)) user.lastpago = 0
      if (!isNumber(user.lastcode)) user.lastcode = 0
      if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
      if (!isNumber(user.lastduel)) user.lastduel = 0
      if (!isNumber(user.lastmining)) user.lastmining = 0
      if (!('muto' in user)) user.muto = false
      if (!('premium' in user)) user.premium = false
      if (!user.premium) user.premiumTime = 0
      if (!('registered' in user)) user.registered = false
      if (!('genre' in user)) user.genre = ''
      if (!('birth' in user)) user.birth = ''
      if (!('marry' in user)) user.marry = ''
      if (!('description' in user)) user.description = ''
      if (!('packstickers' in user)) user.packstickers = null
      if (!user.registered) {
        if (!('name' in user)) user.name = m.name
        if (!isNumber(user.age)) user.age = -1
        if (!isNumber(user.regTime)) user.regTime = -1
      }
      if (!isNumber(user.afk)) user.afk = -1
      if (!('afkReason' in user)) user.afkReason = ''
      if (!('role' in user)) user.role = 'Nuv'
      if (!('banned' in user)) user.banned = false
      if (!('useDocument' in user)) user.useDocument = false
      if (!isNumber(user.bank)) user.bank = 0
      if (!isNumber(user.warn)) user.warn = 0
    }

    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
    if (chat) {
      if (!('isBanned' in chat)) chat.isBanned = false
      if (!('sAutoresponder' in chat)) chat.sAutoresponder = ''
      if (!('welcome' in chat)) chat.welcome = false
      if (!('autoAceptar' in chat)) chat.autoAceptar = false
      if (!('autosticker' in chat)) chat.autosticker = false
      if (!('autoRechazar' in chat)) chat.autoRechazar = false
      if (!('autoresponder' in chat)) chat.autoresponder = false
      if (!('detect' in chat)) chat.detect = true
      if (!('economy' in chat)) chat.economy = true
      if (!('gacha' in chat)) chat.gacha = true
      if (!('antiBot' in chat)) chat.antiBot = false
      if (!('antiBot2' in chat)) chat.antiBot2 = false
      if (!('modoadmin' in chat)) chat.modoadmin = false
      if (!('antiLink' in chat)) chat.antiLink = true
      if (!('reaction' in chat)) chat.reaction = false
      if (!('nsfw' in chat)) chat.nsfw = false
      if (!('antifake' in chat)) chat.antifake = false
      if (!('delete' in chat)) chat.delete = false
      if (!isNumber(chat.expired)) chat.expired = 0
    }

    let settings = global.db.data.settings[this.user.jid]
    if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
    if (settings) {
      if (!('self' in settings)) settings.self = false
      if (!('restrict' in settings)) settings.restrict = true
      if (!('jadibotmd' in settings)) settings.jadibotmd = true
      if (!('antiPrivate' in settings)) settings.antiPrivate = false
      if (!('autoread' in settings)) settings.autoread = false
    } else {
      global.db.data.settings[this.user.jid] = {
        self: false,
        restrict: true,
        jadibotmd: true,
        antiPrivate: false,
        autoread: false,
        status: 0
      }
    }

  } catch (e) {
    console.error(e)
  }

  if (opts['nyimak']) return
  if (!m.fromMe && opts['self']) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
  const isROwner = [...global.owner.map(([n]) => n)].map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
  const isOwner = isROwner || m.fromMe
  const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
  const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0
  if (m.isBaileys) return

  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    let queque = this.msgqueque, time = 5000
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setInterval(async function () {
      if (queque.indexOf(previousID) === -1) clearInterval(this)
      await delay(time)
    }, time)
  }

  m.exp += Math.ceil(Math.random() * 10)

  let usedPrefix
  const groupMetadata = m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}
  const participants = m.isGroup ? groupMetadata?.participants || [] : []
  const numBot = conn.user?.lid ? conn.user.lid.replace(/:.*/, '') : ''
  const detectwhat2 = m.sender.includes('@lid') ? `${numBot}@lid` : conn.user.jid
  const user = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}
  const bot = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === detectwhat2) : {}
  const isRAdmin = user?.admin === 'superadmin'
  const isAdmin = isRAdmin || user?.admin === 'admin'
  const isBotAdmin = bot?.admin
  m.isWABusiness = global.conn.authState?.creds?.platform === 'smba' || global.conn.authState?.creds?.platform === 'smbi'
  m.isChannel = m.chat.includes('@newsletter') || m.sender.includes('@newsletter')

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    const __filename = join(___dirname, name)

    if (typeof plugin.all === 'function') {
      try {
        await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
      } catch (e) { console.error(e) }
    }

    if (!opts['restrict'] && plugin.tags?.includes('admin')) continue

    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.⚡]/g, '\\$&')
    let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix || global.prefix
    let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
      Array.isArray(_prefix) ? _prefix.map(p => [new RegExp(str2Regex(p)).exec(m.text), new RegExp(str2Regex(p))]) :
        typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
          [[[], new RegExp]])?.find(p => p[1])

    if (typeof plugin.before === 'function') {
      if (await plugin.before.call(this, m, {
        match, conn: this, participants, groupMetadata, user, bot,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
        chatUpdate, __dirname: ___dirname, __filename
      })) continue
    }

    if (typeof plugin !== 'function') continue

    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split(/\s+/)
      args = args || []
      let _args = noPrefix.trim().split(/\s+/).slice(1)
      let text = _args.join(' ')
      command = (command || '').toLowerCase()
      let fail = plugin.fail || global.dfail

      let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
        Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          typeof plugin.command === 'string' ? plugin.command === command : false

      if ((m.id.startsWith('NJX-') || m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('B24E') && m.id.length === 20)) return

      if (!isAccept) continue

      m.plugin = name

      if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
        let chat = global.db.data.chats[m.chat]
        let user = global.db.data.users[m.sender]

        if (!['grupo-unbanchat.js'].includes(name) && chat?.isBanned && !isROwner) return
        if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return
        if (m.text && user.banned && !isROwner) {
          m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
          user.antispam++
          return
        }

        if (user.antispam2 && isROwner) return
        let time = global.db.data.users[m.sender].spam + 3000
        if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`)
        global.db.data.users[m.sender].spam = new Date * 1

        let setting = global.db.data.settings[this.user.jid]
        if (name != 'grupo-unbanchat.js' && chat?.isBanned) return
        if (name != 'owner-unbanuser.js' && user?.banned) return
      }

      let hl = _prefix
      let adminMode = global.db.data.chats[m.chat]?.modoadmin
      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin) return

      if (plugin.rowner && !isROwner) return fail('rowner', m, this)
      if (plugin.owner && !isOwner) return fail('owner', m, this)
      if (plugin.mods && !isMods) return fail('mods', m, this)
      if (plugin.premium && !isPrems) return fail('premium', m, this)
      if (plugin.group && !m.isGroup) return fail('group', m, this)
      if (plugin.botAdmin && !isBotAdmin) return fail('botAdmin', m, this)
      if (plugin.admin && !isAdmin) return fail('admin', m, this)
      if (plugin.private && m.isGroup) return fail('private', m, this)

      m.isCommand = true
      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
      m.exp += xp

      try {
        await plugin.call(this, m, {
          match, usedPrefix, noPrefix, _args, args, command, text,
          conn: this, participants, groupMetadata, user, bot,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin,
          isPrems, chatUpdate, __dirname: ___dirname, __filename
        })
        if (!isPrems) m.coin = m.coin || plugin.coin || false
      } catch (e) {
        m.error = e
        console.error(e)
        let text = format(e)
        for (let key of Object.values(global.APIKeys)) text = text.replace(new RegExp(key, 'g'), 'Administrador')
        m.reply(text)
      }

      if (typeof plugin.after === 'function') {
        try {
          await plugin.after.call(this, m, {
            match, usedPrefix, noPrefix, _args, args, command, text,
            conn: this, participants, groupMetadata, user, bot,
            isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin,
            isPrems, chatUpdate, __dirname: ___dirname, __filename
          })
        } catch (e) {
          console.error(e)
        }
      }

      if (m.coin) conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
      break
    }
  }

  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn, comando = '') => {
  const msg = {
    rowner: `✤ Este comando es solo para el *Creador del Bot*.`,
    owner: `✤ Este comando es solo para el *Owner/SubBots*.`,
    mods: `✤ Solo los *Moderadores* pueden usar este comando.`,
    premium: `✤ Este comando es solo para *Usuarios Premium*.`,
    group: `✤ Este comando solo funciona en *Grupos*.`,
    private: `✤ Este comando solo funciona en *Privado*.`,
    admin: `✤ Este comando es solo para *Admins del grupo*.`,
    botAdmin: `✤ El bot debe ser *Administrador* para usar este comando.`,
    unreg: `✤ Debes registrarte primero para usar este comando.`,
    restrict: `✤ Esta función está *desactivada*.`
  }[type]
  if (msg) return conn.reply(m.chat, msg, m).then(() => m.react?.('✖️'))
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.conns?.length > 0) {
    for (const conn of global.conns.filter(c => c?.user && c?.ws?.socket?.readyState !== 3)) {
      conn.subreloadHandler(false)
    }
  }
})
