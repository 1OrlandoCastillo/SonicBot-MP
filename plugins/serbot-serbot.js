const { DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys') import NodeCache from 'node-cache' import fs from 'fs' import path from 'path' import pino from 'pino' import * as ws from 'ws' import chalk from 'chalk' const { exec } = await import('child_process') const { CONNECTING } = ws import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => { const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])] if (subBots.length >= 20) return m.reply(No se han encontrado espacios para *Sub-Bots* disponibles.)

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender let id = ${who.split@[0]} let pathYukiJadiBot = path.join(./serbot/, id) if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

let options = { pathYukiJadiBot, m, conn, args, usedPrefix, command, fromCommand: true } global.db.data.users[m.sender].Subs = new Date * 1 yukiJadiBot(options) }

handler.help = ['code'] handler.tags = ['serbot'] handler.command = ['code', 'codebot'] export default handler

export async function yukiJadiBot(options) { let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options

const rtx2 = "✿ Vincula tu cuenta usando el código:\n\nMas opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número\n\n> Código válido solo para este número."

let txtCode, codeBot

if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true }) try { args[0] && fs.writeFileSync(path.join(pathYukiJadiBot, "creds.json"), JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) } catch { return conn.reply(m.chat, Use correctamente el comando » ${usedPrefix + command} code, m) }

let { version } = await fetchLatestBaileysVersion() const msgRetry = (MessageRetryMap) => { } const msgRetryCache = new NodeCache() const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

const connectionOptions = { logger: pino({ level: 'fatal' }), printQRInTerminal: false, auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) }, msgRetry, msgRetryCache, browser: ['Ubuntu', 'Chrome', '110.0.5585.95'], version, generateHighQualityLinkPreview: true }

let sock = makeWASocket(connectionOptions) sock.isInit = false let isInit = true

async function connectionUpdate(update) { const { connection, lastDisconnect, isNewLogin } = update

if (isNewLogin) sock.isInit = false

if (!sock.authState.creds.registered) {
  let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
  secret = secret.match(/.{1,4}/g)?.join("-")
  txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
  codeBot = await m.reply(secret)

  if (txtCode && txtCode.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
  if (codeBot && codeBot.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
  if ([428, 408, 500, 515].includes(reason)) {
    console.log(chalk.magentaBright(`Reconectando la sesión +${path.basename(pathYukiJadiBot)}...`))
    await creloadHandler(true).catch(console.error)
  }
  if ([405, 401].includes(reason)) {
    console.log(chalk.magentaBright(`Credenciales no válidas. Borrando sesión +${path.basename(pathYukiJadiBot)}`))
    fs.rmdirSync(pathYukiJadiBot, { recursive: true })
  }
  if (reason === 440 || reason === 403) {
    fs.rmdirSync(pathYukiJadiBot, { recursive: true })
  }
}

if (connection === 'open') {
  let userName = sock.authState.creds.me.name || 'Anónimo'
  console.log(chalk.cyanBright(`🟢 ${userName} (+${path.basename(pathYukiJadiBot)}) conectado correctamente.`))
  sock.isInit = true
  global.conns.push(sock)
}

}

setInterval(() => { if (!sock.user) { try { sock.ws.close() } catch { } sock.ev.removeAllListeners() let i = global.conns.indexOf(sock) if (i >= 0) { delete global.conns[i] global.conns.splice(i, 1) } } }, 60000)

let handler = await import('../handler.js') let creloadHandler = async function (restatConn) { try { const Handler = await import(../handler.js?update=${Date.now()}) if (Object.keys(Handler || {}).length) handler = Handler } catch (e) { console.error('Error al recargar handler:', e) }

if (restatConn) {
  try { sock.ws.close() } catch { }
  sock.ev.removeAllListeners()
  sock = makeWASocket(connectionOptions)
  isInit = true
}

if (!isInit) {
  sock.ev.off("messages.upsert", sock.handler)
  sock.ev.off("connection.update", sock.connectionUpdate)
  sock.ev.off('creds.update', sock.credsUpdate)
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

creloadHandler(false) }
