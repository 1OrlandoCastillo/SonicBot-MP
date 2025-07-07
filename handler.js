import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(res => setTimeout(() => res(), ms))

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

    let user = global.db.data.users[m.sender] ||= {}
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

    let chat = global.db.data.chats[m.chat] ||= {}
    if (!('isBanned' in chat)) chat.isBanned = false
    if (!('bienvenida' in chat)) chat.bienvenida = true
    if (!('antiLink' in chat)) chat.antiLink = false
    if (!('onlyLatinos' in chat)) chat.onlyLatinos = false
    if (!('nsfw' in chat)) chat.nsfw = false
    if (!isNumber(chat.expired)) chat.expired = 0

    let settings = global.db.data.settings[this.user.jid] ||= {}
    if (!('self' in settings)) settings.self = false
    if (!('autoread' in settings)) settings.autoread = false

  } catch (e) {
    console.error(e)
  }

  if (opts.nyimak || (opts.self && !m.fromMe) || (opts.swonly && m.chat !== 'status@broadcast')) return
  if (typeof m.text !== 'string') m.text = ''

  const _user = global.db.data?.users?.[m.sender] || {}
  const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([n]) => n)].map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isOwner = isROwner || m.fromMe
  const isMods = isOwner || global.mods.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isPrems = isROwner || global.prems.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.prem === true

  if (opts.queque && m.text && !(isMods || isPrems)) {
    let queue = this.msgqueque
    let time = 5000
    const prevID = queue[queue.length - 1]
    queue.push(m.id || m.key.id)
    setInterval(async function () {
      if (!queue.includes(prevID)) clearInterval(this)
      await delay(time)
    }, time)
  }

  if (m.isBaileys) return

  m.exp += Math.ceil(Math.random() * 10)

  const groupMetadata = m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => null)) : {}
  const participants = m.isGroup ? groupMetadata.participants || [] : []
  const userData = participants.find(u => conn.decodeJid(u.id) === m.sender) || {}
  const botData = participants.find(u => conn.decodeJid(u.id) === this.user.jid) || {}
  const isRAdmin = userData.admin === 'superadmin'
  const isAdmin = isRAdmin || userData.admin === 'admin'
  const isBotAdmin = botData?.admin

  const pluginPath = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    const filename = join(pluginPath, name)

    if (typeof plugin.all === 'function') {
      try {
        await plugin.all.call(this, m, { chatUpdate, __dirname: pluginPath, __filename: filename })
      } catch (e) {
        console.error(e)
      }
    }

    if (!opts.restrict && plugin.tags?.includes('admin')) continue

    let _prefix = plugin.customPrefix || conn.prefix || global.prefix
    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let match = (_prefix instanceof RegExp
      ? [[_prefix.exec(m.text), _prefix]]
      : Array.isArray(_prefix)
        ? _prefix.map(p => [new RegExp(str2Regex(p)).exec(m.text), new RegExp(str2Regex(p))])
        : typeof _prefix === 'string'
          ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
          : [[[], new RegExp]]
    ).find(p => p[1])

    if (typeof plugin.before === 'function') {
      let skip = await plugin.before.call(this, m, {
        match, conn: this, participants, groupMetadata, user: userData, bot: botData,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate,
        __dirname: pluginPath, __filename: filename
      })
      if (skip) continue
    }

    if (typeof plugin !== 'function') continue
    if (!(usedPrefix = match?.[0]?.[0])) continue

    let noPrefix = m.text.replace(usedPrefix, '')
    let [command, ...args] = noPrefix.trim().split(/\s+/)
    args = args || []
    let _args = noPrefix.trim().split(/\s+/).slice(1)
    let text = _args.join(' ')
    command = (command || '').toLowerCase()
    let fail = plugin.fail || global.dfail

    let isAccept = plugin.command instanceof RegExp
      ? plugin.command.test(command)
      : Array.isArray(plugin.command)
        ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
        : plugin.command === command

    if (!isAccept) continue

    m.plugin = name

    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let setting = global.db.data.settings[this.user.jid]

    if ((chat?.isBanned && name !== 'group-unbanchat.js') ||
        (user?.banned && name !== 'owner-unbanuser.js') ||
        (setting?.banned && name !== 'owner-unbanbot.js')) return

    if (plugin.rowner && !isROwner) return fail('rowner', m, this)
    if (plugin.owner && !isOwner) return fail('owner', m, this)
    if (plugin.mods && !isMods) return fail('mods', m, this)
    if (plugin.premium && !isPrems) return fail('premium', m, this)
    if (plugin.group && !m.isGroup) return fail('group', m, this)
    if (plugin.botAdmin && !isBotAdmin) return fail('botAdmin', m, this)
    if (plugin.admin && !isAdmin) return fail('admin', m, this)
    if (plugin.private && m.isGroup) return fail('private', m, this)
    if (plugin.register && !_user.registered) return fail('unreg', m, this)

    m.isCommand = true
    m.exp += (isNumber(plugin.exp) ? plugin.exp : 17)

    if (!isPrems && plugin.limit && user.limit < plugin.limit) {
      conn.reply(m.chat, 'Se agotaron tus *✿ Lovelloud*', m, rcanal)
      continue
    }

    try {
      await plugin.call(this, m, {
        match, usedPrefix, noPrefix, _args, args, command, text,
        conn: this, participants, groupMetadata, user: userData, bot: botData,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin,
        isPrems, chatUpdate, __dirname: pluginPath, __filename: filename
      })
      if (!isPrems) m.limit = plugin.limit || 0
    } catch (e) {
      m.error = e
      console.error(e)
      let errText = format(e).replace(new RegExp(Object.values(global.APIKeys).join('|'), 'g'), '#HIDDEN#')
      m.reply(errText)
    } finally {
      if (typeof plugin.after === 'function') {
        await plugin.after.call(this, m)
      }
      if (m.limit) conn.reply(m.chat, `Utilizaste *${+m.limit}* ✿`, m, rcanal)
    }

    break
  }

  global.dfail = (type, m, conn) => {
    const msg = {
      rowner: '✤ Comando exclusivo del *Creador*.',
      owner: '✤ Solo *Creador/Subbots* pueden usar este comando.',
      mods: '✤ Solo *Moderadores* pueden usar esto.',
      premium: '✤ Solo usuarios *Premium* pueden usar este comando.',
      group: '✤ Solo utilizable en *grupos*.',
      private: '✤ Este comando solo funciona en *privado*.',
      admin: '✤ Solo los *Admins del grupo* pueden usar esto.',
      botAdmin: '✤ Necesito ser *admin* para ejecutar este comando.',
      unreg: '✤ Debes estar *registrado* para usar este comando.',
      restrict: '✤ Esta función está *desactivada*.'
    }[type]
    if (msg) return conn.reply(m.chat, msg, m, rcanal).then(() => m.react('✖️'))
  }

  if (opts.queque && m.text) {
    const index = this.msgqueque.indexOf(m.id || m.key.id)
    if (index !== -1) this.msgqueque.splice(index, 1)
  }

  if (m?.sender && (_user = global.db.data.users[m.sender])) {
    _user.exp += m.exp
    _user.limit -= m.limit * 1
  }

  if (m?.plugin) {
    let now = Date.now()
    let stat = global.db.data.stats[m.plugin] ||= {
      total: 0, success: 0, last: 0, lastSuccess: 0
    }
    stat.total++
    stat.last = now
    if (!m.error) {
      stat.success++
      stat.lastSuccess = now
    }
  }

  try {
    if (!opts.noprint) (await import('./lib/print.js')).default(m, this)
  } catch (e) {
    console.log(m, m.quoted, e)
  }

  let settingsREAD = global.db.data.settings[this.user.jid] || {}
  if (opts.autoread || settingsREAD.autoread) await this.readMessages([m.key])
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})
