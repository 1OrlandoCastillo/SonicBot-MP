import { fileURLToPath } from 'url'
import { spawn, exec } from 'child_process'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'

const { CONNECTING } = ws
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, command, args }) => {
  const id = m.sender.split('@')[0]
  const folder = path.join('./subbots', id)
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

  let isCode = command === 'code'
  if (args[0] && isCode) {
    try {
      const decoded = Buffer.from(args[0], 'base64').toString('utf-8')
      fs.writeFileSync(path.join(folder, 'creds.json'), decoded)
    } catch {
      return m.reply('✖ Código inválido.')
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(folder)
  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys) },
    version,
    browser: ['SubBot', 'Chrome', '1.0.0'],
    msgRetryCache
  })

  sock.isInit = false
  sock.uptime = Date.now()
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr, isNewLogin }) => {
    const reason = lastDisconnect?.error?.output?.statusCode || 0

    if (connection === 'open') {
      sock.userId = id
      if (!global.conns.find(s => s.userId === sock.userId)) {
        global.conns.push(sock)
      }
      console.log(chalk.greenBright(`✅ SUB-BOT ${id} conectado.`))
    }

    if (qr && !isCode) {
      const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 })
      const msg = await conn.sendMessage(m.chat, { image: qrBuffer, caption: `✿ *Escanea este QR desde otro WhatsApp para convertirte en Sub-Bot.*` }, { quoted: m })
      setTimeout(() => conn.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 60000)
    }

    if (qr && isCode) {
      let code = await sock.requestPairingCode(id)
      code = code.match(/.{1,4}/g)?.join('-')
      const caption = `✿ *Código de emparejamiento válido por 60 segundos:*\n\n\`\`\`${code}\`\`\``
      const msg = await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
      setTimeout(() => conn.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 60000)
    }

    if (connection === 'close') {
      if ([428, 408, 440, 500].includes(reason)) {
        console.log(chalk.yellowBright(`⏳ Reconectando SubBot ${id}...`))
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        global.conns = global.conns.filter(c => c !== sock)
        setTimeout(() => handler(m, { conn, command, args }), 5000)
      } else if ([401, 403].includes(reason)) {
        console.log(chalk.redBright(`❌ SubBot ${id} desconectado permanentemente. Borrando sesión.`))
        fs.rmSync(folder, { recursive: true, force: true })
      }
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue
      try {
        let { handler } = await import('../handler.js')
        await handler(sock, msg)
      } catch (e) {
        console.error(e)
      }
    }
  })
}

handler.help = ['qr', 'code']
handler.tags = ['jadibot']
handler.command = ['qr', 'code']
handler.register = false

export default handler
