const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = await import("@whiskeysockets/baileys")
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import * as ws from "ws"
const { spawn, exec } = await import("child_process")
const { fileURLToPath } = "url"
import { makeWASocket } from "../lib/simple.js"

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "✿ *Vincula tu cuenta usando el qr:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr*\n\n> *Qr válido solo para este número.*"
let rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*"

if (!(global.conns instanceof Array)) global.conns = []

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws && conn.ws.readyState !== ws.CLOSED)])]
  if (subBots.length >= 20) return m.reply('No hay espacio disponible para Sub-Bots.')

  const who = m.mentionedJid?.[0] || m.fromMe ? conn.user.jid : m.sender
  const id = `${who.split`@`[0]}`
  const pathAYBot = path.join('./Serbot', id)
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  AYBot({ pathAYBot, m, conn, args, usedPrefix, command })
  global.db.data.users[m.sender].Subs = new Date() * 1
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

  const mcode = args.some(a => /(--code|code)/.test(a?.trim()))
  let txtCode, codeBot, txtQR
  if (mcode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1]?.replace(/^--code$|^code$/, "").trim()
    if (!args[0]) args[0] = undefined
  }

  const pathCreds = path.join(pathAYBot, "creds.json")
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  try {
    if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
  } catch {
    conn.reply(m.chat, `Usa correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathAYBot)

    const connectionOptions = {
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0'] : ['Anya Forger (SubBot)', 'Chrome', '2.0.0'],
      generateHighQualityLinkPreview: true,
      msgRetryCache,
      getMessage: async (key) => {
        const jid = key.remoteJid
        const msg = await store.loadMessage?.(jid, key.id)
        return msg?.message || ''
      }
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    global.conns.push(sock)
    let isInit = true

    const creloadHandler = async (restartConn = false) => {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Handler && Object.keys(Handler).length) handler = Handler
      } catch (e) {
        console.error(e)
      }

      if (restartConn) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions)
        isInit = true
      }

      if (!isInit) {
        sock.ev.off('messages.upsert', sock.handler)
        sock.ev.off('connection.update', sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)

      sock.ev.on('messages.upsert', sock.handler)
      sock.ev.on('connection.update', sock.connectionUpdate)
      sock.ev.on('creds.update', sock.credsUpdate)

      isInit = false
    }

    const connectionUpdate = async (update) => {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (isNewLogin) sock.isInit = true

      if (qr && !mcode) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m })
        if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
        return
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(m.sender.split`@`[0])
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)
        console.log(secret)
      }

      if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
      if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)

      if (connection === 'open') {
        console.log(chalk.cyan(`🟢 Subbot +${path.basename(pathAYBot)} conectado correctamente.`))
        if (!global.db.data) await loadDatabase()
        await joinChannels(sock)
      }

      if (connection === 'close') {
        if ([428, 408, 440, 500].includes(reason)) {
          console.log(chalk.yellow(`Reintentando conexión SubBot (+${path.basename(pathAYBot)})...`))
          await creloadHandler(true)
        } else if ([401, 405, 403].includes(reason)) {
          console.log(chalk.red(`Sesión inválida/reemplazada. Eliminando carpeta ${pathAYBot}`))
          fs.rmSync(pathAYBot, { recursive: true, force: true })
        }
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }

    process.on('uncaughtException', console.error)

    setInterval(async () => {
      if (!sock?.user || sock?.ws?.readyState === ws.CLOSED) {
        try { sock?.ws?.close() } catch {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }, 180000)

    await creloadHandler(false)
  })
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}
