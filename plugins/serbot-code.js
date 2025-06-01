const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import fs from "fs"
import pino from 'pino'
import * as ws from 'ws'
const { CONNECTING } = ws
import { Boom } from '@hapi/boom'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

// Asegurar carpeta ./serbot existe
if (!fs.existsSync('./serbot')) fs.mkdirSync('./serbot', { recursive: true })

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  let parent = args[0] === 'plz' ? _conn : await global.conn
  if (!(args[0] === 'plz' || (await global.conn).user.jid === _conn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal: wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`)
  }

  async function serbot() {
    const phoneNumber = m.sender.split('@')[0]
    const userFolder = `./serbot/${phoneNumber}`

    // Crear carpeta de sesión si no existe
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true })

    // Guardar creds desde args[0] si se pasa como base64
    if (args[0]) {
      const decoded = Buffer.from(args[0], "base64").toString("utf-8")
      fs.writeFileSync(`${userFolder}/creds.json`, JSON.stringify(JSON.parse(decoded), null, 2))
    }

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

        await parent.reply(m.chat, args[0] ? '✅ Conectado con éxito.' : '✅ Sub-Bot conectado con éxito.\n\n📌 *Nota:* Este bot es temporal.\nSi el bot principal se reinicia, se perderá la sesión.', m)
        await sleep(5000)

        if (!args[0]) {
          await parent.reply(conn.user.jid, 'La próxima vez que desees conectarte, usa este código:', m)
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`${userFolder}/creds.json`), "utf-8").toString("base64")
          }, { quoted: m })
        }
      }
    }

    // Autoreconexión
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

    // Cierre forzado si no conecta en 30s
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

    // Solicita pairing code si es primera vez
    if (!conn.authState.creds.registered) {
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