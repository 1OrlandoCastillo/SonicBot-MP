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
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return

    m.exp = 0
    m.limit = false

    // Asegurar decodeJid
    if (!this.decodeJid) {
      this.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
          const [user] = jid.split(':')
          return user + '@s.whatsapp.net'
        }
        return jid
      }
    }

    m.sender = this.decodeJid(m.sender)
    m.chat = this.decodeJid(m.chat)

    if (!this.user?.jid) this.user = { jid: this.decodeJid(this.user?.id || this.user?.jid || global.conn?.user?.id || '') }

    try {
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {}
      if (user) {
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.limit)) user.limit = 10
        if (!('premium' in user)) user.premium = false
        if (!user.premium) user.premiumTime = 0
        if (!('registered' in user)) user.registered = false
        if (!user.registered) {
          if (!('name' in user)) user.name = m.name
          if (!isNumber(user.age)) user.age = -1
          if (!isNumber(user.regTime)) user.regTime = -1
        }
        if (!isNumber(user.afk)) user.afk = -1
        if (!('afkReason' in user)) user.afkReason = ''
        if (!('banned' in user)) user.banned = false
        if (!('useDocument' in user)) user.useDocument = false
        if (!isNumber(user.level)) user.level = 0
        if (!isNumber(user.bank)) user.bank = 0
      } else {
        global.db.data.users[m.sender] = {
          exp: 0, limit: 10, registered: false, name: m.name,
          age: -1, regTime: -1, afk: -1, afkReason: '', banned: false,
          useDocument: true, bank: 0, level: 0
        }
      }

      let chat = global.db.data.chats[m.chat]
      if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
      if (chat) {
        if (!('isBanned' in chat)) chat.isBanned = false
        if (!('bienvenida' in chat)) chat.bienvenida = true 
        if (!('antiLink' in chat)) chat.antiLink = false
        if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
        if (!('nsfw' in chat)) chat.nsfw = false
        if (!isNumber(chat.expired)) chat.expired = 0
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false, bienvenida: true, antiLink: false,
          onlyLatinos: false, nsfw: false, expired: 0
        }
      }

      var settings = global.db.data.settings[this.user.jid]
      if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
      if (settings) {
        if (!('self' in settings)) settings.self = false
        if (!('autoread' in settings)) settings.autoread = false
      } else global.db.data.settings[this.user.jid] = {
        self: false, autoread: false, status: 0
      }
    } catch (e) {
      console.error(e)
    }

    const opts = global.opts || {}

    if (opts.nyimak) return
    if (!m.fromMe && opts.self) return
    if (opts.swonly && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    const _user = global.db.data.users[m.sender] || {}

    const isROwner = [this.decodeJid(global.conn.user.id), ...global.owner.map(([n]) => n)].map(v => v.replace(/\D+/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods.map(v => v.replace(/\D+/g, '') + '@s.whatsapp.net').includes(m.sender)
    const isPrems = isROwner || global.prems.map(v => v.replace(/\D+/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.premium === true

    if (opts.queque && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 5000
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    let usedPrefix
    const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
    const participants = (m.isGroup ? groupMetadata.participants || [] : [])
    const user = (m.isGroup ? participants.find(u => this.decodeJid(u.id) === m.sender) : {}) || {}
    const bot = (m.isGroup ? participants.find(u => this.decodeJid(u.id) == this.user.jid) : {}) || {}
    const isRAdmin = user?.admin == 'superadmin'
    const isAdmin = isRAdmin || user?.admin == 'admin'
    const isBotAdmin = bot?.admin || false

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    // Continúa con tu loop de plugins...
    // (no editado aquí porque ya lo tienes bien definido)

  } catch (e) {
    console.error(e)
  } finally {
    // Lógica final
    if (opts.queque && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1)
        this.msgqueque.splice(quequeIndex, 1)
    }

    try {
      if (!opts.noprint) await (await import('./lib/print.js')).default(m, this)
    } catch (e) {
      console.log(m, m.quoted, e)
    }

    const settingsREAD = global.db.data.settings[this.user.jid] || {}
    if (opts.autoread) await this.readMessages([m.key])
    if (settingsREAD.autoread) await this.readMessages([m.key])
  }
}

// dfail global intacto
global.dfail = (type, m, conn, usedPrefix) => {
  let msg = {
    rowner: `✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot.`,
    owner: `✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot y *Sub Bots*.`,
    mods: `✤ Hola, este comando solo puede ser utilizado por los *Moderadores* de la Bot.`,
    premium: `✤ Hola, este comando solo puede ser utilizado por Usuarios *Premium*.`,
    group: `✤ Hola, este comando solo puede ser utilizado en *Grupos*.`,
    private: `✤ Hola, este comando solo puede ser utilizado en mi Chat *Privado*.`,
    admin: `✤ Hola, este comando solo puede ser utilizado por los *Administradores* del Grupo.`,
    botAdmin: `✤ Hola, la bot debe ser *Administradora* para ejecutar este Comando.`,
    unreg: `✤ Hola, para usar este comando debes estar *Registrado.*`,
    restrict: `✤ Hola, esta característica está *deshabilitada.*`
  }[type]
  if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}

// Watch updates
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})
