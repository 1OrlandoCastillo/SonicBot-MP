const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import util from "util"
import * as ws from "ws"
const { exec } = await import("child_process")
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from "url"
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const yukiJBOptions = {}
if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let time = global.db.data.users[m.sender].Subs + 120000
  const subBots = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  if (subBots.length === 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)

  let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
  let id = who.split`@`[0]
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  Object.assign(yukiJBOptions, { pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand: true })
  yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}
handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix } = options
  args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
  if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
  if (!args[0]) args[0] = undefined

  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  try {
    if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
  } catch {
    conn.reply(m.chat, `❌ Use correctamente el comando » ${usedPrefix}code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)
    const sock = makeWASocket({
      logger: pino({ level: "fatal" }),
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetry: () => { },
      msgRetryCache: new NodeCache(),
      browser: ['Ubuntu', 'Chrome', '110.0.5585.95'],
      version,
      generateHighQualityLinkPreview: true
    })

    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update
      if (isNewLogin) sock.isInit = false

      if (isNewLogin) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")
        await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        await m.reply(secret)
        console.log(secret)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        if ([428, 408, 500, 515].includes(reason)) await creloadHandler(true).catch(console.error)
        if ([405, 401, 403].includes(reason)) fs.rmdirSync(pathYukiJadiBot, { recursive: true })
      }

      if (connection === 'open') {
        let name = sock.authState.creds.me.name || 'Anónimo'
        console.log(chalk.bold.cyanBright(`\n🟢 ${name} (+${path.basename(pathYukiJadiBot)}) conectado exitosamente.`))
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)
      }
    }

    sock.ev.on("connection.update", connectionUpdate)
    sock.ev.on("messages.upsert", (await import('../handler.js')).handler.bind(sock))
    sock.ev.on("creds.update", saveCreds)

    setInterval(() => {
      if (!sock.user) {
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }, 60000)

    async function creloadHandler(restart) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Error en reloadHandler:', e)
      }

      if (restart) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off("creds.update", sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)

      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)

      isInit = false
      return true
    }

    await creloadHandler(false)
  })
}

async function joinChannels(conn) {
  for (const id of Object.values(global.ch)) {
    await conn.newsletterFollow(id).catch(() => {})
  }
}
