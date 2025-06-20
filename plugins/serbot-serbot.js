import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import util from "util"
import * as ws from "ws"
import { spawn, exec } from "child_process"
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const crm1 = "Y2QgcGx1Z2lucy"
const crm2 = "A7IG1kNXN1b"
const crm3 = "SBpbmZvLWRvbmFyLmpz"
const crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

const rtx = "✿ Vincula tu cuenta usando el qr:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr\n\n> Qr válido solo para este número."
const rtx2 = "✿ Vincula tus cuenta usando el código:\n\nMás opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número\n\n> Código válido solo para este número."

if (!(global.conns instanceof Array)) global.conns = []

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const subBots = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  if (subBots.length >= 20) return m.reply("No se han encontrado espacios para Sub-Bots disponibles.")

  const who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
      ? conn.user.jid
      : m.sender

  const id = `${who.split('@')[0]}`
  const pathYukiJadiBot = path.join(__dirname, 'subbots', id)
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  const yukiJBOptions = { pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand: true }
  await yukiJadiBot(yukiJBOptions)
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
    args.unshift('code')
  }

  const mcode = args.some(arg => /(--code|code)/.test(arg))
  let txtCode, codeBot, txtQR

  if (mcode) {
    args = args.map(arg => arg.replace(/^--code$|^code$/, "").trim()).filter(Boolean)
  }

  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

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
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
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

      if (qr && !mcode && m?.chat) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx }, { quoted: m })
        if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
        return
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(secret)
        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || 0
      if (connection === 'close') {
        console.log(chalk.bold.magenta(`[REINTENTANDO SUBBOT ${path.basename(pathYukiJadiBot)} - Motivo: ${reason}]`))
        await creloadHandler(true).catch(console.error)
      }

      if (connection === 'open') {
        sock.isInit = true
        global.conns.push(sock)
        console.log(chalk.green(`[✓] SubBot ${sock.user.id.split('@')[0]} conectado.`))
      }
    }

    sock.ev.on("connection.update", connectionUpdate)
    sock.ev.on("creds.update", saveCreds)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Nuevo error: ', e)
      }

      if (restatConn) {
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
    }

    creloadHandler(false)

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }, 60000)
  })
}
