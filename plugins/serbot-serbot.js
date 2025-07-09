const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import * as ws from "ws"
const { spawn, exec } = await import("child_process")
const { CONNECTING } = ws
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

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
const AYBotOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let time = global.db.data.users[m.sender].Subs + 120000
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  const subBotsCount = subBots.length

  if (subBotsCount >= 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathAYBot = path.join(`./${bot}/`, id)
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  AYBotOptions.pathAYBot = pathAYBot
  AYBotOptions.m = m
  AYBotOptions.conn = conn
  AYBotOptions.args = args
  AYBotOptions.usedPrefix = usedPrefix
  AYBotOptions.command = command
  AYBotOptions.fromCommand = true

  AYBot(AYBotOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
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

  const mcode = args.find(x => /--code|code/.test(x?.trim()))
  let txtCode, codeBot, txtQR

  if (mcode) {
    args = args.map(x => x?.replace(/^--code$|^code$/, '').trim()).filter(Boolean)
  }

  const pathCreds = path.join(pathAYBot, "creds.json")
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  try {
    if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
  } catch {
    conn.reply(m.chat, `Use correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async () => {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathAYBot)

    let sock
    const startSock = () => {
      const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetry: () => { },
        msgRetryCache,
        browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Anya Forger (Sub Bot)', 'Chrome', '2.0.0'],
        version,
        generateHighQualityLinkPreview: true
      }
      sock = makeWASocket(connectionOptions)
      setupEvents()
    }

    const setupEvents = () => {
      sock.ev.on("creds.update", saveCreds)
      sock.ev.on("connection.update", connectionUpdate)
      importHandler()
    }

    const connectionUpdate = async ({ connection, lastDisconnect, isNewLogin, qr }) => {
      if (qr && !mcode && m?.chat) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m })
        if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(m.sender.split`@`[0])
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)
        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        switch (reason) {
          case 428: case 408: case 515: case 500:
            console.log(chalk.magentaBright(`\nSubbot (+${path.basename(pathAYBot)}) desconectado (${reason}). Reintentando...\n`))
            await restartSock()
            break
          case 403: case 440: case 405: case 401:
            console.log(chalk.magentaBright(`\nSesión inválida (+${path.basename(pathAYBot)}). Eliminando...\n`))
            fs.rmSync(pathAYBot, { recursive: true, force: true })
            break
          default:
            console.log(chalk.redBright(`Desconectado por razón desconocida: ${reason}`))
        }
      }

      if (connection === 'open') {
        console.log(chalk.cyanBright(`🟢 Subbot (+${path.basename(pathAYBot)}) conectado exitosamente.`))
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)
      }
    }

    const restartSock = async () => {
      try {
        sock.ev.removeAllListeners()
        try { sock.ws?.close() } catch { }
        startSock()
      } catch (e) {
        console.error('Error al reiniciar SubBot:', e)
      }
    }

    const importHandler = async () => {
      try {
        let handler = await import(`../handler.js?update=${Date.now()}`)
        if (handler?.handler) {
          sock.ev.on("messages.upsert", handler.handler.bind(sock))
        }
      } catch (e) {
        console.error('Error al importar handler:', e)
      }
    }

    setInterval(async () => {
      if (!sock.user || sock.ws.readyState === ws.CLOSED || sock.ws.readyState === ws.CLOSING) {
        console.log(chalk.yellowBright(`\n🔁 Detectado subbot caído: +${path.basename(pathAYBot)}. Reconectando...\n`))
        await restartSock()
      }
    }, 30000)

    startSock()
  })
}

async function joinChannels(conn) {
  for (const id of Object.values(global.ch)) {
    await conn.newsletterFollow(id).catch(() => { })
  }
}
