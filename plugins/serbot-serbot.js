import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import qrcode from "qrcode"
import { makeWASocket } from "../lib/simple.js"

const rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*"

export async function yukiJadiBotCode(options) {
  let { pathYukiJadiBot, m, conn, args } = options
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  try {
    if (args[0]) {
      const decoded = Buffer.from(args[0], "base64").toString("utf-8")
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(decoded), null, '\t'))
    } else {
      throw new Error("Código base64 no proporcionado")
    }
  } catch (e) {
    return conn.reply(m.chat, `✿ Usa correctamente el comando con código.`, m)
  }

  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()
  const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

  const connectionOptions = {
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '110.0.5585.95'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    msgRetryCache,
    generateHighQualityLinkPreview: true
  }

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false

  let isInit = true

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (connection === "open") {
      sock.isInit = true
      global.conns.push(sock)
      console.log(chalk.bold.greenBright(`\n✔ Sub-Bot por CÓDIGO conectado: +${path.basename(pathYukiJadiBot)}`))
    }

    if (connection === "close") {
      if ([DisconnectReason.badSession, 401, 405].includes(reason)) {
        console.log(chalk.bold.redBright(`\n✘ Sesión inválida: ${path.basename(pathYukiJadiBot)}. Eliminando...`))
        fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
      } else if ([428, 408].includes(reason)) {
        console.log(chalk.bold.yellowBright(`\n↻ Reconectando sub-bot: ${path.basename(pathYukiJadiBot)}`))
        creloadHandler(true).catch(console.error)
      } else if (reason === 440) {
        console.log(chalk.bold.magentaBright(`\n⚠ La sesión fue reemplazada manualmente (+${path.basename(pathYukiJadiBot)}).`))
      } else if (reason === 500) {
        console.log(chalk.bold.red(`\n✘ Error interno (500): ${path.basename(pathYukiJadiBot)}. Reiniciando...`))
        fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
        creloadHandler(true).catch(console.error)
      } else {
        console.log(chalk.gray(`⚠ Desconectado: ${connection} (${reason})`))
      }

      let i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }
  })

  sock.ev.on("creds.update", saveCreds)

  // Mostrar código de emparejamiento
  let secret = await sock.requestPairingCode(m.sender.split`@`[0])
  secret = secret.match(/.{1,4}/g)?.join("-")

  const txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
  const codeBot = await m.reply(secret)

  if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
  if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)

  // Manejador de recarga en reconexión
  async function creloadHandler(restart = false) {
    let handler = await import('../handler.js')
    if (restart) {
      const oldChats = sock.chats
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions, { chats: oldChats })
      sock.ev.on("messages.upsert", handler.handler.bind(sock))
      sock.ev.on("connection.update", sock.connectionUpdate = connectionUpdate)
      sock.ev.on("creds.update", saveCreds)
    }
    isInit = false
  }

  // Autoeliminación si se desconecta completamente
  setInterval(() => {
    if (!sock.user) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      let i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }
  }, 60000)
}
