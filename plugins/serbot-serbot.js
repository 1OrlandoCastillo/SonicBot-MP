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
  // Obtener conexión principal
  let mainConn = await global.conn

  // Si hay conexiones hijas en global.conns, usar la primera como _conn
  let _conn = global.conns.length ? global.conns[0] : null

  // Determinar cuál será la conexión padre (main o sub-bot)
  let parent = args[0] && args[0] === 'plz' ? _conn : mainConn

  // Validación: si se pide 'plz' pero _conn no existe
  if (args[0] && args[0] === 'plz' && !_conn) {
    return m.reply('No hay sub-bots activos actualmente.')
  }

  // Validación: solo permitir ejecutar en bot principal si no es 'plz'
  if (!args[0] || args[0] !== 'plz') {
    if (mainConn.user.jid !== parent?.user?.jid) {
      return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${mainConn.user.jid.split`@`[0]}?text=${usedPrefix}code`)
    }
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0]
    if (!fs.existsSync("./serbot/" + authFolderB)) {
      fs.mkdirSync("./serbot/" + authFolderB, { recursive: true })
    }

    if (args[0]) {
      fs.writeFileSync(
        "./serbot/" + authFolderB + "/creds.json",
        JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')
      )
    }

    const { state, saveState, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`)
    const msgRetryCounterMap = (MessageRetryMap) => { }
    const msgRetryCounterCache = new NodeCache()
    const { version } = await fetchLatestBaileysVersion()
    let phoneNumber = m.sender.split('@')[0]

    const methodCodeQR = process.argv.includes("qr")
    const methodCode = !!phoneNumber || process.argv.includes("code")
    const MethodMobile = process.argv.includes("mobile")

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: MethodMobile,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (clave) => {
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
      if (!phoneNumber) return process.exit(0)

      let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '')
      if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) return process.exit(0)

      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(cleanedNumber)
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
        let txt = `✿ *Vincula tu cuenta usando el código.*\n\n`
        txt += `[ ✰ ] Sigue las instrucciones:\n`
        txt += `*» Más opciones*\n`
        txt += `*» Dispositivos vinculados*\n`
        txt += `*» Vincular nuevo dispositivo*\n`
        txt += `*» Vincular usando número*\n\n`
        txt += `> *Nota:* Este código solo funciona en el número que lo solicitó`

        let pp = "./storage/mp4/serbot.mp4"
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
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) conn.isInit = true
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
        let i = global.conns.indexOf(conn)
        if (i < 0) return console.log(await creloadHandler(true).catch(console.error))
        delete global.conns[i]
        global.conns.splice(i, 1)
        if (code !== DisconnectReason.connectionClosed) {
          parent.sendMessage(m.chat, { text: "Conexión perdida.." }, { quoted: m })
        }
      }

      if (global.db.data == null) loadDatabase()

      if (connection == 'open') {
        conn.isInit = true
        global.conns.push(conn)
        await parent.reply(m.chat, args[0] ? 'Conectado con éxito' : 'Conectado exitosamente con WhatsApp\n\n*Nota:* Esto es temporal. Si el bot principal se reinicia o se detiene, los sub-bots también lo harán.\n\nGuarda este enlace: https://whatsapp.com/channel/0029VaBfsIwGk1FyaqFcK91S', m, rcanal)
        await sleep(5000)
        if (!args[0]) {
          await parent.reply(conn.user.jid, `La próxima vez que se conecte envíe este mensaje para iniciar sesión sin otro código`, m, rcanal)
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " + Buffer.from(fs.readFileSync("./serbot/" + authFolderB + "/creds.json"), "utf-8").toString("base64")
          }, { quoted: m })
        }
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
        fs.rmdirSync(`./serbot/${authFolderB}`, { recursive: true })
      }
    }, 30000)

    let handlerModule = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handlerModule = Handler
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
