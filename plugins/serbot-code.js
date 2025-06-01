import {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} from '@whiskeysockets/baileys'
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
  let parent = args[0] === 'plz' ? _conn : await global.conn
  if (!(args[0] === 'plz' || (await global.conn).user.jid === _conn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`)
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0]
    let authPath = `./serbot/${authFolderB}`
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true })
    if (args[0]) fs.writeFileSync(`${authPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))

    const { state, saveCreds } = await useMultiFileAuthState(authPath)
    const msgRetryCounterCache = new NodeCache()
    const { version } = await fetchLatestBaileysVersion()
    let phoneNumber = m.sender.split('@')[0]

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
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
      version
    }

    let conn = makeWASocket(connectionOptions)

    console.log(`[${authFolderB}] ¿Sesión ya registrada?:`, conn.authState.creds.registered)

    if (!conn.authState.creds.registered && phoneNumber) {
      let cleaned = phoneNumber.replace(/\D/g, '')
      if (!Object.keys(PHONENUMBER_MCC).some(mcc => cleaned.startsWith(mcc))) {
        console.warn(`[${authFolderB}] Número no tiene un prefijo MCC válido: ${cleaned}`)
        await star.reply(m.chat, `❌ El número ${cleaned} no tiene un prefijo MCC válido. Usa un número en formato internacional (ej. 521234567890)`, m)
        return
      }

      setTimeout(async () => {
        try {
          let codeBot = await conn.requestPairingCode(cleaned)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          let txt = `✿ *Vincula tu cuenta usando el código.*\n\n`
          txt += `[ ✰ ] Sigue las instrucciones:\n`
          txt += `*» Más opciones*\n*» Dispositivos vinculados*\n*» Vincular nuevo dispositivo*\n*» Vincular usando número*\n\n`
          txt += `> *Nota:* Este Código solo funciona en el número que lo solicitó`
          let sendTxt = await star.reply(m.chat, txt, m)
          let sendCode = await star.reply(m.chat, codeBot, m)
          setTimeout(() => {
            star.sendMessage(m.chat, { delete: sendTxt })
            star.sendMessage(m.chat, { delete: sendCode })
          }, 60000) // aumenta a 60 segundos
        } catch (err) {
          console.error(`[${authFolderB}] Error al solicitar código de emparejamiento:`, err)
          await star.reply(m.chat, `❌ No se pudo generar el código de emparejamiento. Error: ${err.message}`, m)
        }
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
        const shouldReconnect = ![
          DisconnectReason.loggedOut,
          DisconnectReason.connectionReplaced,
          DisconnectReason.badSession
        ].includes(statusCode)

        console.log(`[${authFolderB}] Desconectado: ${reason || 'Desconocido'} - Código: ${statusCode}`)

        if (shouldReconnect) {
          console.log(`[${authFolderB}] Reintentando conexión...`)
          try {
            conn.ev.removeAllListeners()
            conn = makeWASocket(connectionOptions)
            await creloadHandler(false)
          } catch (err) {
            console.error(`[${authFolderB}] Error al reconectar:`, err)
          }
        } else {
          console.log(`[${authFolderB}] Sesión cerrada permanentemente.`)
          try { fs.rmSync(authPath, { recursive: true, force: true }) } catch { }
        }
      }

      if (connection === 'open') {
        conn.isInit = true
        global.conns.push(conn)

        await parent.reply(m.chat, args[0]
          ? '✅ Sub-bot conectado exitosamente con el código.'
          : '✅ Sub-bot vinculado exitosamente. Este sub-bot se mantendrá activo durante días si no se cierra sesión.', m)

        await sleep(3000)

        if (!args[0]) {
          await parent.reply(conn.user.jid, `La próxima vez que quieras conectarte, usa este mensaje:`, m)
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`${authPath}/creds.json`), "utf-8").toString("base64")
          }, { quoted: m })
        }
      }

      if (global.db.data == null) loadDatabase()
    }

    setInterval(async () => {
      if (!conn.user || conn.ws.readyState !== CONNECTING && conn.ws.readyState !== 1) {
        console.log(`[${authFolderB}] Socket desconectado. Reintentando...`)
        try {
          conn.ev.removeAllListeners()
          conn = makeWASocket(connectionOptions)
          await creloadHandler(false)
        } catch (err) {
          console.error(`[${authFolderB}] Error al reconectar desde watchdog:`, err)
        }
      }
    }, 1000 * 60 * 5)

    let handlerModule = await import('../handler.js')

    let creloadHandler = async function (restatConn) {
      try {
        const updatedHandler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (updatedHandler && Object.keys(updatedHandler).length) handlerModule = updatedHandler
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

      conn.handler = handlerModule.handler.bind(conn)
      conn.connectionUpdate = connectionUpdate.bind(conn)
      conn.credsUpdate = saveCreds.bind(conn, true)

      conn.ev.on('messages.upsert', conn.handler)
      conn.ev.on('connection.update', conn.connectionUpdate)
      conn.ev.on('creds.update', conn.credsUpdate)

      isInit = false
      return true
    }

    await creloadHandler(false)
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
