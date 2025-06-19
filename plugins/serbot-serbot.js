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

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  let parent = global.conn

  async function serbot() {
    let authFolderB = m.sender.split('@')[0]
    let dir = `./serbot/${authFolderB}`

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (args[0]) {
      let base64 = Buffer.from(args[0], "base64").toString("utf-8")
      fs.writeFileSync(`${dir}/creds.json`, JSON.stringify(JSON.parse(base64), null, '\t'))
    }

    const { state, saveCreds } = await useMultiFileAuthState(dir)
    const msgRetryCounterMap = MessageRetryMap => { }
    const msgRetryCounterCache = new NodeCache()
    const { version } = await fetchLatestBaileysVersion()
    let phoneNumber = m.sender.split('@')[0]

    const methodCode = !!phoneNumber

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = (texto) => new Promise(resolve => rl.question(texto, resolve))

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async clave => {
        let jid = jidNormalizedUser(clave.remoteJid)
        let msg = await store.loadMessage(jid, clave.id)
        return msg?.message || ""
      },
      msgRetryCounterCache,
      msgRetryCounterMap,
      defaultQueryTimeoutMs: undefined,
      version
    }

    let conn = makeWASocket(connectionOptions)

    if (methodCode && !conn.authState.creds.registered) {
      if (!phoneNumber) process.exit(0)
      let cleaned = phoneNumber.replace(/[^0-9]/g, '')
      if (!Object.keys(PHONENUMBER_MCC).some(v => cleaned.startsWith(v))) process.exit(0)

      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(cleaned)
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot

        let txt = `✿ *Vincula tu cuenta usando el código*\n\n` +
                  `[ ✰ ] Sigue las instrucciones:\n` +
                  `» *Más opciones*\n` +
                  `» *Dispositivos vinculados*\n` +
                  `» *Vincular nuevo dispositivo*\n` +
                  `» *Vincular usando número*\n\n` +
                  `> *Nota:* Este código solo funciona en el número que lo solicitó`

        let sendTxt = await star.reply(m.chat, txt, m)
        let sendCode = await star.reply(m.chat, codeBot, m)

        setTimeout(() => {
          star.sendMessage(m.chat, { delete: sendTxt.key })
          star.sendMessage(m.chat, { delete: sendCode.key })
        }, 30000)
        rl.close()
      }, 3000)
    }

    conn.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update
      if (isNewLogin) conn.isInit = true

      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (code && code !== DisconnectReason.loggedOut && !conn?.ws?.socket) {
        let i = global.conns.indexOf(conn)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }

        if (code !== DisconnectReason.connectionClosed) {
          parent.sendMessage(m.chat, { text: "Conexión perdida..." }, { quoted: m })
        }
      }

      if (global.db?.data == null) loadDatabase?.()

      if (connection == 'open') {
        conn.isInit = true
        global.conns.push(conn)

        await parent.reply(m.chat, args[0]
          ? '✅ Sub-Bot conectado correctamente.'
          : '✅ Conectado exitosamente con WhatsApp.\n\n*Nota:* Esta conexión es temporal. Si el bot principal se reinicia o se apaga, los subbots también se desconectarán.\n\n🔗 Canal: https://whatsapp.com/channel/0029VaBffIw4k1FfaqF4K91S', m)

        await sleep(5000)

        if (args[0]) return

        await parent.reply(conn.user.jid, `✅ Puedes volver a conectarte con este mensaje la próxima vez sin volver a generar un código`, m)
        await parent.sendMessage(conn.user.jid, {
          text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`${dir}/creds.json`), "utf-8").toString("base64")
        }, { quoted: m })
      }
    }

    const timeoutId = setTimeout(() => {
      if (!conn.user) {
        try { conn.ws.close() } catch { }
        conn.ev.removeAllListeners()
        let i = global.conns.indexOf(conn)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
        fs.rmSync(dir, { recursive: true, force: true })
      }
    }, 30000)

    let importedHandler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) importedHandler = Handler
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

      conn.handler = importedHandler.handler.bind(conn)
      conn.connectionUpdate = connectionUpdate.bind(conn)
      conn.credsUpdate = saveCreds.bind(conn, true)

      conn.ev.on('messages.upsert', conn.handler)
      conn.ev.on('connection.update', conn.connectionUpdate)
      conn.ev.on('creds.update', conn.credsUpdate)
      isInit = false
      return true
    }

    creloadHandler(false)
  }

  serbot()
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code', 'codebot']
handler.rowner = false

export default handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
