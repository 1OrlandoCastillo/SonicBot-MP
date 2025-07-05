import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys" import qrcode from "qrcode" import NodeCache from "node-cache" import fs from "fs" import path from "path" import pino from "pino" import chalk from "chalk" import util from "util" import * as ws from "ws" import { child, spawn, exec } from "child_process" import { makeWASocket } from "../lib/simple.js" import { fileURLToPath } from "url"

const { CONNECTING } = ws const __filename = fileURLToPath(import.meta.url) const __dirname = path.dirname(__filename)

const crm1 = "Y2QgcGx1Z2lucy" const crm2 = "A7IG1kNXN1b" const crm3 = "SBpbmZvLWRvbmFyLmpz" const crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz" const drm1 = "" const drm2 = "" const rtx = "✿ Vincula tu cuenta usando el qr:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr\n\n> Qr válido solo para este número." const rtx2 = "✿ Vincula tu cuenta usando el código:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número\n\n> Código válido solo para este número."

const yukiJBOptions = {} if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => { let time = global.db.data.users[m.sender].Subs + 120000

const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])] if (subBots.length === 20) return m.reply(No se han encontrado espacios para *Sub-Bots* disponibles.)

let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender) let id = ${who.split@[0]} let pathYukiJadiBot = path.join(./${jadi}/, id) if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

Object.assign(yukiJBOptions, { pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand: true })

yukiJadiBot(yukiJBOptions) global.db.data.users[m.sender].Subs = new Date * 1 }

handler.help = ['qr', 'code'] handler.tags = ['serbot'] handler.command = ['qr', 'code'] export default handler

// La función principal de conexión del sub-bot export async function yukiJadiBot(options) { let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options

if (command === 'code') { command = 'qr' args.unshift('code') }

const mcode = args[0]?.match(/(--code|code)/) || args[1]?.match(/(--code|code)/) if (mcode) { args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim() if (args[0] === "") args[0] = undefined }

const pathCreds = path.join(pathYukiJadiBot, "creds.json") if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

try { if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) } catch { conn.reply(m.chat, Use correctamente el comando » ${usedPrefix + command} code, m) return }

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64") exec(comb.toString("utf-8"), async (err, stdout, stderr) => { const drmer = Buffer.from(drm1 + drm2, base64) const { version } = await fetchLatestBaileysVersion() const msgRetryCache = new NodeCache() const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

const connectionOptions = {
  logger: pino({ level: "fatal" }),
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
  },
  msgRetry: () => {},
  msgRetryCache,
  browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou (Sub Bot)', 'Chrome', '2.0.0'],
  version,
  generateHighQualityLinkPreview: true
}

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin, qr } = update

  if (isNewLogin) sock.isInit = false

  if (qr && !mcode) {
    if (m?.chat) {
      const qrImage = await qrcode.toBuffer(qr, { scale: 8 })
      const qrMsg = await conn.sendMessage(m.chat, { image: qrImage, caption: rtx }, { quoted: m })
      setTimeout(() => conn.sendMessage(m.sender, { delete: qrMsg.key }), 30000)
    }
    return
  }

  if (qr && mcode) {
    let secret = await sock.requestPairingCode(m.sender.split`@`[0])
    secret = secret.match(/.{1,4}/g)?.join("-")
    const msg = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
    await m.reply(secret)
    setTimeout(() => conn.sendMessage(m.sender, { delete: msg.key }), 30000)
  }

  const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (connection === 'close') {
    // Manejo por razón de desconexión
    // ... (Puedes mantener la lógica tal como la tienes)
  }

  if (connection === 'open') {
    let userName = sock.authState.creds.me.name || 'Anónimo'
    let userJid = sock.authState.creds.me.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`
    console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathYukiJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
    sock.isInit = true
    global.conns.push(sock)
    await joinChannels(sock)
  }
}

const creloadHandler = async (restartConn) => {
  try {
    const handler = await import(`../handler.js?update=${Date.now()}`)
    if (restartConn) {
      const oldChats = sock.chats
      try { sock.ws.close() } catch {}
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
  } catch (e) {
    console.error("Nuevo error:", e)
  }
}

sock.ev.on("connection.update", connectionUpdate)
creloadHandler(false)

setInterval(() => {
  if (!sock.user) {
    try { sock.ws.close() } catch {}
    sock.ev.removeAllListeners()
    let i = global.conns.indexOf(sock)
    if (i >= 0) global.conns.splice(i, 1)
  }
}, 60000)

}) }

function msToTime(duration) { let seconds = Math.floor((duration / 1000) % 60) let minutes = Math.floor((duration / (1000 * 60)) % 60) minutes = minutes < 10 ? '0' + minutes : minutes seconds = seconds < 10 ? '0' + seconds : seconds return minutes + ' m y ' + seconds + ' s ' }

async function joinChannels(conn) { for (const channelId of Object.values(global.ch)) { await conn.newsletterFollow(channelId).catch(() => { }) } }

