const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys')

import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import fs from 'fs'
import pino from 'pino'
import * as ws from 'ws'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

if (!fs.existsSync('./serbot')) fs.mkdirSync('./serbot', { recursive: true })

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  const parent = await global.conn
  const isForced = args[0] === 'plz'
  const isBotPrincipal = m.sender === parent.user.jid

  if (!isForced && !isBotPrincipal) {
    return m.reply(
      `🚫 *Acceso denegado*\n\nEste comando solo puede ser usado desde el bot principal.\n\n📱 Intenta desde:\nwa.me/${parent.user.jid.split('@')[0]}?text=${usedPrefix}code`
    )
  }

  async function serbot() {
    const phoneNumber = m.sender.split('@')[0]
    const userFolder = `./serbot/${phoneNumber}`

    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true })

    if (args[0] && args[0] !== 'plz') {
      const decoded = Buffer.from(args[0], "base64").toString("utf-8")
      fs.writeFileSync(`${userFolder}/creds.json`, JSON.stringify(JSON.parse(decoded), null, 2))
    }

    const exists = fs.existsSync(`${userFolder}/creds.json`)
    if (exists) console.log(`[✅] Sesión existente encontrada para ${phoneNumber}. Intentando reconectar...`)

    const { state, saveCreds } = await useMultiFileAuthState(userFolder)
    const msgRetryCounterCache = new NodeCache()
    const { version } = await fetchLatestBaileysVersion()

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      msgRetryCounterCache,
      msgRetryCounterMap: (MessageRetryMap) => {},
      getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid)
        let msg = await store.loadMessage(jid, key.id)
        return msg?.message || ""
      },
      version
    }

    let conn = makeWASocket(connectionOptions)
    conn.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (isNewLogin) conn.isInit = true

      if (code && code !== DisconnectReason.loggedOut && conn?.ws?.socket == null) {
        let i = global.conns.indexOf(conn)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
        if (code !== DisconnectReason.connectionClosed) {
          parent.sendMessage(m.chat, { text: "Conexión perdida..." }, { quoted: m })
        }
      }

      if (connection === 'open') {
        conn.isInit = true
        global.conns.push(conn)

        if (exists && args[0]) {
          await parent.reply(m.chat, '✅ *Reconectado automáticamente usando una sesión existente.*', m)
        } else {
          await parent.reply(m.chat,
`✅ *Sub-Bot conectado exitosamente.*

📌 *Importante:* Esta sesión es *temporal*. Si el bot principal se reinicia, se perderá.

🔁 Guarda el código que recibirás para reconectarte fácilmente.`, m)
        }

        await sleep(5000)

        if (!args[0] && !exists) {
          await parent.reply(conn.user.jid, '📥 Aquí está tu código para futuras conexiones:', m)
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`${userFolder}/creds.json`), "utf-8").toString("base64")
          }, { quoted: m })
        }
      }
    }

    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Handler && typeof Handler.handler === 'function') handler = Handler
      } catch (e) {
        console.error(e)
      }

      if (restatConn) {
        try { conn.ws.close() } catch { }
        conn.ev.removeAllListeners()
        conn = makeWASocket(connectionOptions)
        isInit = true
      }

      if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler)
        conn.ev.off('connection.update', conn.connectionUpdate)
        conn.ev.off('creds.update', conn.credsUpdate)
      }

      conn.handler = handler.handler.bind(conn)
      conn.connectionUpdate = connectionUpdate.bind(conn)
      conn.credsUpdate = saveCreds.bind(conn, true)

      conn.ev.on('messages.upsert', conn.handler)
      conn.ev.on('connection.update', conn.connectionUpdate)
      conn.ev.on('creds.update', conn.credsUpdate)

      isInit = false
      return true
    }

    const timeoutId = setTimeout(() => {
      if (!conn.user) {
        try { conn.ws.close() } catch {}
        conn.ev.removeAllListeners()
        let i = global.conns.indexOf(conn)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
        fs.rmdirSync(userFolder, { recursive: true })
        console.log(`[⛔] Sub-bot de ${phoneNumber} eliminado por inactividad.`)
      }
    }, 30000)

    await creloadHandler(false)

    if (!exists && !conn.authState.creds.registered) {
      let cleaned = phoneNumber.replace(/[^0-9]/g, '')
      if (Object.keys(PHONENUMBER_MCC).some(v => cleaned.startsWith(v))) {
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(cleaned)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          let txt = `✿ *Vincula tu cuenta usando el código:*\n\n*📲 Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*`
          await star.reply(m.chat, txt, m)
          let sendCode = await star.reply(m.chat, codeBot, m)
          setTimeout(() => {
            star.sendMessage(m.chat, { delete: sendCode })
          }, 30000)
        }, 3000)
      }
    }
  }

  await serbot()
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code', 'codebot']
handler.rowner = false

export default handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}