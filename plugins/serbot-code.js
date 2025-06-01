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

let handler = async (m, { conn: star, args, usedPrefix, command, isOwner }) => {
  let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn
  if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`)
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0]
    if (!fs.existsSync("./serbot/" + authFolderB)) {
      fs.mkdirSync("./serbot/" + authFolderB, { recursive: true })
    }
    if (args[0]) fs.writeFileSync(`./serbot/${authFolderB}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))

    const { state, saveState, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`)
    const msgRetryCounterCache = new NodeCache()
    const { version } = await fetchLatestBaileysVersion()
    let phoneNumber = m.sender.split('@')[0]

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: false,
      browser: [ "Ubuntu", "Chrome", "20.0.04" ],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid)
        let msg = await store.loadMessage(jid, key.id)
        return msg?.message || ""
      },
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
      version
    }

    let conn = makeWASocket(connectionOptions)

    // Autenticación por código si se requiere
    if (!conn.authState.creds.registered && phoneNumber) {
      let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '')
      if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) return
      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(cleanedNumber)
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
        let txt = `✿ *Vincula tu cuenta usando el código.*\n\n`
        txt += `[ ✰ ] Sigue las instrucciones:\n`
        txt += `*» Más opciones*\n*» Dispositivos vinculados*\n*» Vincular nuevo dispositivo*\n*» Vincular usando número*\n\n`
        txt += `> *Nota:* Este Código solo funciona en el número que lo solicitó`

        let sendTxt = await star.reply(m.chat, txt, m, rcanal)
        let sendCode = await star.reply(m.chat, codeBot, m, rcanal)
        setTimeout(() => {
          star.sendMessage(m.chat, { delete: sendTxt })
          star.sendMessage(m.chat, { delete: sendCode })
        }, 30000)
        rl.close()
      }, 3000)
    }

    conn.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update
      if (isNewLogin) conn.isInit = true

      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      const reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message

      if (connection === 'close') {
        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut &&
          statusCode !== DisconnectReason.connectionReplaced &&
          statusCode !== DisconnectReason.badSession &&
          !reason?.toLowerCase().includes('logged out')

        console.log(`[${authFolderB}] Desconectado: ${reason || 'Desconocido'} - Código: ${statusCode}`)

        if (shouldReconnect) {
          console.log(`[${authFolderB}] Reintentando conexión...`)
          try {
            conn.ev.removeAllListeners()
            conn = makeWASocket(connectionOptions)
            creloadHandler(false)
          } catch (err) {
            console.error(`[${authFolderB}] Error al reconectar:`, err)
          }
        } else {
          console.log(`[${authFolderB}] Sesión cerrada permanentemente.`)
          try { fs.rmSync(`./serbot/${authFolderB}`, { recursive: true, force: true }) } catch {}
        }
      }

      if (connection === 'open') {
        conn.isInit = true
        global.conns.push(conn)
        await parent.reply(m.chat, args[0]
          ? '✅ Sub-bot conectado exitosamente con el código.'
          : '✅ Sub-bot vinculado exitosamente. Este sub-bot se mantendrá activo durante días si no se cierra sesión.', m, rcanal)

        await sleep(3000)

        if (!args[0]) {
          await parent.reply(conn.user.jid, `La próxima vez que quieras conectarte, usa este mensaje:`, m, rcanal)
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`./serbot/${authFolderB}/creds.json`), "utf-8").toString("base64")
          }, { quoted: m })
        }
      }

      if (global.db.data == null) loadDatabase()
    }

    // Watchdog de reconexión periódica
    setInterval(async () => {
      if (!conn.user || conn.ws.readyState !== CONNECTING && conn.ws.readyState !== 1) {
        console.log(`[${authFolderB}] Socket desconectado. Reintentando...`)
        try {
          conn.ev.removeAllListeners()
          conn = makeWASocket(connectionOptions)
          creloadHandler(false)
        } catch (err) {
          console.error(`[${authFolderB}] Error al reconectar desde watchdog:`, err)
        }
      }
    }, 1000 * 60 * 5) // cada 5 minutos

    // Cargar handler y eventos
    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
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
