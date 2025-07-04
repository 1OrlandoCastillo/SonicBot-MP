import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { makeWASocket } from '../lib/simple.js'
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'
import pino from 'pino'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.conns = global.conns || []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender.split('@')[0]
  const sessionPath = path.join('./subbots/', who)
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  const isCode = args[0]?.includes('--code') || args[0]?.includes('code')
  const method = (command === 'code' || isCode) ? 'code' : 'qr'
  const base64 = (method === 'code' && args[0] && !args[0].includes('--code')) ? args[0] : null

  if (base64) {
    try {
      const creds = JSON.parse(Buffer.from(base64, 'base64').toString())
      fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(creds, null, 2))
    } catch {
      return m.reply(`✖ El código es inválido. Usa correctamente: ${usedPrefix + command} code`)
    }
  }

  // 🔥 FORZAR ELIMINACIÓN DE CREDS PARA QUE SE GENERE VINCULACIÓN REAL
  if (method === 'code' && fs.existsSync(path.join(sessionPath, 'creds.json'))) {
    fs.unlinkSync(path.join(sessionPath, 'creds.json'))
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
  const id = path.basename(sessionPath)
  let handlerModule = await import('../handler.js')
  let sock

  const initSocket = () => {
    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: ['SubBot-Yuki', 'Chrome', '110.0'],
      msgRetryCache: new NodeCache(),
      generateHighQualityLinkPreview: true,
      getMessage: async () => ({})
    })

    sock.isInit = false

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', sock.handler = handlerModule.handler.bind(sock))

    sock.ev.on('connection.update', sock.connectionUpdate = async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update
      const reason = lastDisconnect?.error?.output?.statusCode

      if (connection === 'open') {
        console.log(chalk.green(`✔ SubBot conectado exitosamente [+${id}]`))
        global.conns.push(sock)
        await sock.sendMessage(m.sender, {
          text: '🔐 Se ha vinculado correctamente un nuevo SubBot.'
        })
      }

      if (qr && method === 'qr') {
        const buffer = await qrcode.toBuffer(qr, { scale: 8 })
        const msg = await m.conn.sendFile(m.chat, buffer, 'qr.png', '✿ Escanea este QR para vincular tu SubBot.', m)
        setTimeout(() => m.conn.sendMessage(m.chat, { delete: msg.key }), 30000)
      }

      if (method === 'code') {
        try {
          await m.reply('✿ Espera unos segundos mientras generamos tu código de emparejamiento...')
          let pairingCode = await sock.requestPairingCode(m.sender.split('@')[0])
          if (!pairingCode) throw 'No se recibió código de emparejamiento'
          pairingCode = pairingCode.match(/.{1,4}/g).join('-')
          const texto = `✿ Usa este código de emparejamiento:\n\n*${pairingCode}*\n\n➤ WhatsApp → Dispositivos vinculados → Vincular nuevo dispositivo`
          const codeMsg = await m.reply(texto)
          setTimeout(() => m.conn.sendMessage(m.chat, { delete: codeMsg.key }), 30000)
        } catch (e) {
          console.log('[ERROR AL GENERAR EL CÓDIGO]:', e)
          m.reply(`✖ Error al generar el código: ${e?.message || e}`)
        }
      }

      if (connection === 'close') {
        console.log(chalk.red(`✖ SubBot [+${id}] desconectado → Reintentando...`))
        if ([428, 408, 500, DisconnectReason.connectionLost, DisconnectReason.restartRequired].includes(reason)) {
          return reloadHandler(true)
        }
        if ([401, 405, DisconnectReason.loggedOut].includes(reason)) {
          if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true })
        }
      }
    })
  }

  const reloadHandler = async (reconnect = false) => {
    try {
      const updated = await import(`../handler.js?update=${Date.now()}`)
      if (Object.keys(updated).length) handlerModule = updated
    } catch (e) {
      console.error(e)
    }

    if (reconnect) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      initSocket()
    }

    return true
  }

  initSocket()

  setInterval(() => {
    if (!sock.user) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      const i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }
  }, 60000)
}
