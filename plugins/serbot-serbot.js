import { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import { makeWASocket } from '../lib/simple.js'
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.conns = global.conns || []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender.split('@')[0]
  const sessionPath = path.join('./subbots/', who)

  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  const method = command === 'code' ? 'code' : 'qr'
  const base64 = method === 'code' && args[0] ? args[0] : null

  if (base64) {
    try {
      const creds = JSON.parse(Buffer.from(base64, 'base64').toString())
      fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(creds, null, 2))
    } catch {
      return m.reply(`✖ El código es inválido. Usa correctamente: ${usedPrefix + command} code`)
    }
  }

  startSubBot(m, sessionPath, method)
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler

async function startSubBot(m, sessionPath, method) {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  const connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: ['SubBot-Yuki', 'Chrome', '110.0'],
    msgRetryCache: new NodeCache(),
    generateHighQualityLinkPreview: true,
    getMessage: async () => ({})
  }

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  global.conns.push(sock)
  sock.ev.on('creds.update', saveCreds)

  let handlerModule = await import('../handler.js')

  async function reloadHandler(reconnect = false) {
    try {
      const updated = await import(`../handler.js?update=${Date.now()}`)
      if (Object.keys(updated).length) handlerModule = updated
    } catch (e) {
      console.error(e)
    }

    if (reconnect) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions)
    }

    sock.handler = handlerModule.handler.bind(sock)
    sock.connectionUpdate = connectionUpdate
    sock.credsUpdate = saveCreds.bind(sock, true)

    sock.ev.on('messages.upsert', sock.handler)
    sock.ev.on('connection.update', sock.connectionUpdate)
    sock.ev.on('creds.update', sock.credsUpdate)

    sock.isInit = true
  }

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    const reason = lastDisconnect?.error?.output?.statusCode
    const id = path.basename(sessionPath)

    if (connection === 'open') {
      console.log(chalk.green(`✔ SubBot conectado [+${id}]`))
    }

    if (qr && method === 'qr') {
      const buffer = await qrcode.toBuffer(qr, { scale: 8 })
      const msg = await m.conn.sendFile(m.chat, buffer, 'qr.png', '✿ Escanea este QR para vincular tu SubBot.', m)
      setTimeout(() => m.conn.sendMessage(m.chat, { delete: msg.key }), 30000)
    }

    if (method === 'code' && isNewLogin) {
      try {
        let pairing = await sock.requestPairingCode(`${m.sender.split('@')[0]}`)
        pairing = pairing.match(/.{1,4}/g).join('-')
        let codeMsg = await m.reply(`✿ Usa este código de emparejamiento:\n\n*${pairing}*\n\n➤ WhatsApp → Dispositivos vinculados → Vincular nuevo dispositivo`)
        setTimeout(() => m.conn.sendMessage(m.chat, { delete: codeMsg.key }), 30000)
      } catch (e) {
        return m.reply('✖ Error al generar código de emparejamiento.')
      }
    }

    if (connection === 'close') {
      console.log(chalk.red(`✖ SubBot [+${id}] desconectado. Razón: ${reason || 'desconocida'}`))
      if ([428, 408, 500, DisconnectReason.connectionLost, DisconnectReason.restartRequired].includes(reason)) {
        return reloadHandler(true)
      }
      if ([401, 405, DisconnectReason.loggedOut].includes(reason)) {
        if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true })
        return
      }
    }

    if (global.db.data == null) await global.loadDatabase()
  }

  await reloadHandler(false)

  setInterval(() => {
    if (!sock.user) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      const i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }
  }, 60_000)
}
