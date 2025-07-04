const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "✿ *Vincula tu cuenta usando el qr:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr*\n\n> *Qr válido solo para este número.*"
let rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const yukiJBOptions = {}
if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let time = global.db.data.users[m.sender].Subs + 120000

  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  if (subBots.length === 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)

  let who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
  let id = `${who.split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)

  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
  yukiJBOptions.m = m
  yukiJBOptions.conn = conn
  yukiJBOptions.args = args
  yukiJBOptions.usedPrefix = usedPrefix
  yukiJBOptions.command = command
  yukiJBOptions.fromCommand = true

  yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    if (!args.includes('code')) args.unshift('code')
  }
  const mcode = args.includes('code') || args.includes('--code')

  let txtCode, codeBot, txtQR
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")

  try {
    if (args[0] && args[0] !== undefined && args[0] !== 'code') {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
    }
  } catch {
    conn.reply(m.chat, `⚠️ Usa correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetry,
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
          txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m })
          if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
        }
        return
      }

      if (qr && mcode) {
        let waitPair = 0
        while (typeof sock.requestPairingCode !== 'function' && waitPair < 15) {
          await sleep(300)
          waitPair++
        }

        if (typeof sock.requestPairingCode !== 'function') {
          await m.reply('⚠ No se pudo generar el código de emparejamiento. Intenta nuevamente en unos segundos.')
          return endSesion()
        }

        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")

        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)

        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode
      if (connection === 'close') {
        if ([428, 408, 500, 515].includes(reason)) await creloadHandler(true).catch(console.error)
        if ([401, 405, 403].includes(reason)) {
          fs.rmdirSync(pathYukiJadiBot, { recursive: true })
        }
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

    const endSesion = async () => {
      try { sock.ws.close() } catch { }
      sock.ev.removeAllListeners()
      const i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }

    let handler = await import('../handler.js')
    let creloadHandler = async function (restart) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Nuevo error: ', e)
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

    sock.ev.on("connection.update", connectionUpdate)
    sock.ev.on("creds.update", saveCreds)

    setInterval(async () => {
      if (!sock.user) await endSesion()
    }, 60000)

    creloadHandler(false)
  })
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => { })
  }
}
