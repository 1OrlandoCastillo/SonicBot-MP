import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  if (!chatUpdate?.messages) return

  const m = smsg(this, chatUpdate.messages[chatUpdate.messages.length - 1])
  if (!m || m.key?.id?.startsWith('BAE5') || m.messageStubType || !m.message) return

  if (global.db.data == null) await global.loadDatabase().catch(console.error)

  try {
    const userJid = m.sender
    const chatJid = m.chat

    let user = global.db.data.users[userJid] ||= {}
    if (!isNumber(user.exp)) user.exp = 0
    if (!isNumber(user.limit)) user.limit = 10
    if (!('premium' in user)) user.premium = false
    if (!('registered' in user)) user.registered = false
    if (!('name' in user)) user.name = m.name
    if (!isNumber(user.age)) user.age = -1
    if (!isNumber(user.regTime)) user.regTime = -1
    if (!isNumber(user.afk)) user.afk = -1
    if (!('afkReason' in user)) user.afkReason = ''
    if (!('banned' in user)) user.banned = false
    if (!isNumber(user.level)) user.level = 0
    if (!isNumber(user.bank)) user.bank = 0

    let chat = global.db.data.chats[chatJid] ||= {}
    if (!('isBanned' in chat)) chat.isBanned = false
    if (!('bienvenida' in chat)) chat.bienvenida = true
    if (!('antiLink' in chat)) chat.antiLink = false
    if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
    if (!('nsfw' in chat)) chat.nsfw = false
    if (!isNumber(chat.expired)) chat.expired = 0

    let settings = global.db.data.settings[this.user.jid] ||= {}
    if (!('self' in settings)) settings.self = false
    if (!('autoread' in settings)) settings.autoread = false

    if (opts['nyimak']) return
    if (!m.fromMe && opts['self']) return
    if (opts['swonly'] && chatJid !== 'status@broadcast') return

    m.exp = 0
    m.limit = false
    m.text = m?.text || m?.body || m?.message?.conversation || ''

    const decodeJid = jid => jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    const userJidNorm = decodeJid(userJid)
    const isROwner = [this.user?.id, ...global.owner.map(([n]) => decodeJid(n))].includes(userJidNorm)
    const isOwner = isROwner || m.fromMe
    const isMods = isOwner || global.mods.map(decodeJid).includes(userJidNorm)
    const isPrems = isROwner || global.prems.map(decodeJid).includes(userJidNorm) || user.premium

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      const queque = this.msgqueque
      const last = queque[queque.length - 1]
      queque.push(m.key.id)
      const interval = setInterval(async () => {
        if (!queque.includes(last)) clearInterval(interval)
        await delay(3000)
      }, 3000)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    const groupMetadata = m.isGroup ? await this.groupMetadata(chatJid).catch(_ => null) : {}
    const participants = groupMetadata?.participants || []
    const userData = m.isGroup ? participants.find(p => decodeJid(p.id) === userJidNorm) : {}
    const botData = m.isGroup ? participants.find(p => decodeJid(p.id) === this.user.jid) : {}

    const isRAdmin = userData?.admin === 'superadmin'
    const isAdmin = isRAdmin || userData?.admin === 'admin'
    const isBotAdmin = botData?.admin || false

    const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

    for (const name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue

      const __filename = join(__dirname, name)

      if (typeof plugin.all === 'function') {
        await plugin.all.call(this, m, { chatUpdate, __dirname, __filename })
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ?? this.prefix ?? global.prefix
      let match = (_prefix instanceof RegExp ?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ?
          _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(m.text), re]
          }) :
          typeof _prefix === 'string' ?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find(p => p[1])

      if (!match) continue

      if (typeof plugin.before === 'function') {
        let skip = await plugin.before.call(this, m, {
          match, conn: this, participants, groupMetadata,
          user: userData, bot: botData,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate,
          __dirname, __filename
        })
        if (skip) continue
      }

      let usedPrefix = (match[0] || '')[0]
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split(/\s+/)
      command = (command || '').toLowerCase()

      let isAccept = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
          plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          typeof plugin.command === 'string' ? plugin.command === command : false

      if (!isAccept) continue

      m.plugin = name
      m.isCommand = true

      const fail = plugin.fail || global.dfail
      if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
      if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
      if (plugin.mods && !isMods) { fail('mods', m, this); continue }
      if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
      if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
      if (plugin.private && m.isGroup) { fail('private', m, this); continue }
      if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
      if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
      if (plugin.register && !user.registered) { fail('unreg', m, this); continue }

      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
      m.exp += (xp > 200 ? 0 : xp)

      if (!isPrems && plugin.limit && user.limit < plugin.limit) {
        await this.reply(chatJid, `✿ Te quedaste sin *limite*.`, m)
        continue
      }

      const extra = {
        match, usedPrefix, noPrefix, args, command, text: args.join(' '),
        conn: this, participants, groupMetadata, user: userData, bot: botData,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate,
        __dirname, __filename
      }

      try {
        await plugin.call(this, m, extra)
        if (!isPrems) user.limit -= plugin.limit || 0
      } catch (e) {
        m.error = e
        console.error(e)
        this.reply(chatJid, format(e).replace(/APIKEY_\w+/g, '#HIDDEN#'), m)
      } finally {
        if (typeof plugin.after === 'function') {
          try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
        }
      }

      break
    }

    global.dfail = (type, m, conn) => {
      const msg = {
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
      if (msg) return conn.reply(m.chat, msg, m).then(() => m.react?.('✖️'))
    }

  } catch (err) {
    console.error(err)
  } finally {
    if (opts['autoread']) this.readMessages([m.key])
  }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.greenBright("Se actualizó 'handler.js'"))
  if (global.reloadHandler) global.reloadHandler()
})
