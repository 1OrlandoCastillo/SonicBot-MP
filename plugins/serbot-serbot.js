import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import * as ws from "ws"
const { child, spawn, exec } = await import("child_process")
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AYBotOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  let userData = global.db.data.users[m.sender] || {}
  userData.Subs = userData.Subs || 0
  let time = userData.Subs + 120000
  const subBots = [...new Set([...global.conns.filter(conn => conn.user && conn.ws?.socket?.readyState !== ws.CLOSED)])]
  const subBotsCount = subBots.length

  if (subBotsCount >= 20) return m.reply("No se han encontrado espacios para *Sub-Bots* disponibles.")

  let who = (m.mentionedJid && m.mentionedJid[0]) || (m.fromMe && conn?.user?.jid) || m.sender
  if (typeof who !== 'string' || !who.includes('@')) return

  let id = who.split("@")[0]
  let pathAYBot = path.join(`./${bot}/`, id)
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  Object.assign(AYBotOptions, { pathAYBot, m, conn, args, usedPrefix, command, fromCommand: true })

  await AYBot(AYBotOptions)
  userData.Subs = new Date * 1
  global.db.data.users[m.sender] = userData
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function AYBot(options) {
  let { pathAYBot, m, conn, args, usedPrefix, command } = options

  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0]?.match(/^--?code$/i) || args[1]?.match(/^--?code$/i)
  if (mcode) args = args.map(arg => arg.replace(/^--?code$/i, '').trim()).filter(Boolean)

  const pathCreds = path.join(pathAYBot, "creds.json")
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  try {
    if (args[0]) {
      const decoded = Buffer.from(args[0], "base64").toString("utf-8")
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(decoded), null, '\t'))
    }
  } catch (e) {
    return m.reply("⚠️ Código inválido o dañado.")
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    const drmer = Buffer.from(drm1 + drm2, "base64")
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathAYBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetry: () => {},
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Anya Forger (Sub Bot)', 'Chrome', '2.0.0'],
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
        let txt = `[ Escaneo de QR requerido ]\n\nEscanea el código QR en WhatsApp:\nMenú (⋮) → Dispositivos vinculados → Vincular nuevo dispositivo\n\n> LOVELLOUD Official`
        let sendQR = await conn.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), "qrcode.png", txt, m)
        setTimeout(() => conn.sendMessage(m.chat, { delete: sendQR.key }), 30000)
        return
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(m.sender.split("@")[0])
        secret = secret?.match(/.{1,4}/g)?.join("-") || secret
        let sendTxt = await conn.reply(m.chat, `[ Vinculación requerida ]`, m)
        let sendCode = await conn.reply(m.chat, secret, m)
        setTimeout(() => {
          conn.sendMessage(m.chat, { delete: sendTxt.key })
          conn.sendMessage(m.chat, { delete: sendCode.key })
        }, 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode

      if (connection === 'close') {
        if ([428, 408, 515].includes(reason)) {
          console.log(chalk.bold.magentaBright(`\n┆ Subbot (+${path.basename(pathAYBot)}) desconectado (${reason}). Intentando reconectar...\n`))
          await creloadHandler(true)
        } else if ([405, 401, 440, 403].includes(reason)) {
          console.log(chalk.bold.magentaBright(`\n┆ Sesión inválida o cerrada. Eliminando carpeta...\n`))
          fs.rmdirSync(pathAYBot, { recursive: true })
        } else if (reason === 500) {
          console.log(chalk.bold.magentaBright(`\n┆ Conexión perdida. Reiniciando...\n`))
          await creloadHandler(true)
        }
      }

      if (connection === 'open') {
        let userName = sock.authState.creds.me.name || 'Anónimo'
        console.log(chalk.bold.cyanBright(`\n🟢 ${userName} (+${path.basename(pathAYBot)}) conectado exitosamente.`))
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        global.conns = global.conns.filter(c => c !== sock)
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async (restartConn) => {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Error recargando handler:', e)
      }

      if (restartConn) {
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions)
        isInit = true
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

    creloadHandler(false)
  })
}

const delay = ms => new Promise(res => setTimeout(res, ms))
const sleep = delay

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} m y ${seconds} s`
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}
