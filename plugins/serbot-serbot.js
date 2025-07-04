import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'

import { makeWASocket } from '../lib/simple.js'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.conns = global.conns || []

let handler = async (m, { conn }) => {
  const who = m.sender.split('@')[0]
  const sessionPath = path.join('./subbots/', who)

  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  startSubBot(m, sessionPath)
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']
export default handler

async function startSubBot(m, sessionPath) {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  let sock
  const id = path.basename(sessionPath)
  let codeSent = false

  const initSocket = () => {
    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
      },
      browser: ['SubBot-Code', 'Chrome', '110.0'],
      msgRetryCache: new NodeCache(),
      generateHighQualityLinkPreview: true,
      getMessage: async () => ({})
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log('[DEBUG] connection update:', update)

      if (connection === 'open') {
        console.log(chalk.green(`✔ SubBot conectado exitosamente [+${id}]`))
        global.conns.push(sock)

        if (!codeSent) {
          try {
            await m.reply('✿ Generando tu código de emparejamiento...')
            const pairing = await sock.requestPairingCode(m.sender.split('@')[0])
            const pairingFormatted = pairing.match(/.{1,4}/g).join('-')
            const texto = `✿ Usa este código de emparejamiento:\n\n*${pairingFormatted}*\n\n➤ WhatsApp → Dispositivos vinculados → Vincular nuevo dispositivo`
            const msg = await m.reply(texto)
            setTimeout(() => m.conn.sendMessage(m.chat, { delete: msg.key }), 30000)
            codeSent = true
          } catch (e) {
            console.log('[ERROR] Al generar pairing code:', e)
            await m.reply('✖ No se pudo generar el código de emparejamiento.')
          }
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

  async function reloadHandler(reconnect = false) {
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
