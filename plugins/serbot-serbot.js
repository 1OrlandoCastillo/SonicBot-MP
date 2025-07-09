import fs from "fs"
import path from "path"
import qrcode from "qrcode"
import pino from "pino"
import chalk from "chalk"
import NodeCache from "node-cache"
import { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, PHONENUMBER_MCC } from "@whiskeysockets/baileys"
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!(global.conns instanceof Array)) global.conns = []

const rtx2 = `✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*`

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let parent = args[0] === 'plz' ? _conn : await global.conn
  if (!((args[0] === 'plz') || (await global.conn).user.jid === _conn.user.jid))
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`)

  const userId = m.sender.split('@')[0]
  const pathAYBot = path.join("./serbot/", userId)
  if (!fs.existsSync(pathAYBot)) fs.mkdirSync(pathAYBot, { recursive: true })

  const AYBotOptions = {
    pathAYBot,
    m,
    conn,
    args,
    usedPrefix,
    command,
    fromCommand: true,
    isCode: true
  }

  AYBot(AYBotOptions)
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']
export default handler

export async function AYBot(options) {
  let { pathAYBot, m, conn, args, usedPrefix, command, isCode } = options
  const pathCreds = path.join(pathAYBot, "creds.json")

  try {
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0]) {
      const base64 = args[0].replace(/^--code$|^code$/, "").trim()
      if (base64) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(base64, "base64").toString("utf-8")), null, '\t'))
    }
  } catch {
    return conn.reply(m.chat, `✿ Usa correctamente el comando:\n\n${usedPrefix + command} code`, m)
  }

  const { state, saveCreds } = await useMultiFileAuthState(pathAYBot)
  const { version } = await fetchLatestBaileysVersion()

  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    msgRetryCache: new NodeCache(),
    browser: ['Ubuntu', 'Chrome', '110.0.5585.95'],
    version,
    generateHighQualityLinkPreview: true
  }

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  let isInit = true

  const sendCodeIfNeeded = async () => {
    if (!sock.authState.creds.registered) {
      const phone = m.sender.split('@')[0]
      if (!Object.keys(PHONENUMBER_MCC).some(v => phone.startsWith(v))) return
      let codeBot = await sock.requestPairingCode(phone)
      codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
      const txt = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
      const txtCode = await m.reply(codeBot)
      setTimeout(() => conn.sendMessage(m.chat, { delete: txt.key }), 30000)
      setTimeout(() => conn.sendMessage(m.chat, { delete: txtCode.key }), 30000)
    }
  }

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin } = update
    if (isNewLogin) sock.isInit = false

    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (connection === 'close') {
      if ([428, 408, 515].includes(reason)) {
        console.log(chalk.bold.magentaBright(`\n┆ Subbot (+${path.basename(pathAYBot)}) desconectado (${reason}). Intentando reconectar...\n`))
        await creloadHandler(true).catch(console.error)
      } else if ([405, 401].includes(reason)) {
        console.log(chalk.bold.redBright(`\n┆ Sesión inválida. Eliminando carpeta: ${pathAYBot}\n`))
        fs.rmdirSync(pathAYBot, { recursive: true })
      } else if ([440, 403].includes(reason)) {
        console.log(chalk.bold.redBright(`\n┆ Sesión reemplazada o en soporte. Eliminando carpeta: ${pathAYBot}\n`))
        fs.rmdirSync(pathAYBot, { recursive: true })
      } else if (reason === 500) {
        console.log(chalk.bold.redBright(`\n┆ Error interno. Intentando reconectar Subbot...\n`))
        return creloadHandler(true).catch(console.error)
      }
    }

    if (connection === 'open') {
      sock.isInit = true
      global.conns.push(sock)
      console.log(chalk.greenBright(`\n🟢 Subbot conectado correctamente: ${sock.user?.jid}\n`))

      if (!args[0]) {
        await conn.reply(m.chat, `✿ *Conectado exitosamente*\n\nEste subbot permanecerá activo mientras el bot principal siga corriendo.\n\nGuardar este enlace para soporte:\nhttps://whatsapp.com/channel/0029VaBfsIwGk1FyaqFcK91S`, m)
      }

      if (args[0]) {
        await conn.reply(sock.user.jid, `✿ Usa este código para reconectar:\n`, m)
        await conn.sendMessage(sock.user.jid, {
          text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(pathCreds), "utf-8").toString("base64")
        }, { quoted: m })
      }
    }
  }

  let handler = await import("../handler.js")
  let creloadHandler = async function (restartConn) {
    try {
      const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
      console.error('Error al recargar handler:', e)
    }

    if (restartConn) {
      try { sock.ws.close() } catch { }
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions)
      isInit = true
    }

    if (!isInit) {
      sock.ev.off("messages.upsert", sock.handler)
      sock.ev.off("connection.update", sock.connectionUpdate)
      sock.ev.off("creds.update", sock.credsUpdate)
    }

    sock.handler = handler.handler.bind(sock)
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)

    sock.ev.on("messages.upsert", sock.handler)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)

    isInit = false
    return true
  }

  creloadHandler(false)
  setTimeout(() => {
    if (!sock.user) {
      try { sock.ws.close() } catch { }
      sock.ev.removeAllListeners()
      const i = global.conns.indexOf(sock)
      if (i >= 0) {
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
      fs.rmdirSync(pathAYBot, { recursive: true })
    }
  }, 30000)

  await sendCodeIfNeeded()
}
