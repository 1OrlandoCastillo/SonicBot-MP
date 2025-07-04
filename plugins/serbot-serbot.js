const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import * as ws from "ws"
const { exec } = await import("child_process")
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, args, usedPrefix }) => {
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  if (subBots.length >= 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)

  let id = `${(m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender).split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  await yukiJadiBot({ pathYukiJadiBot, m, conn, args, usedPrefix, command: 'code', fromCommand: true })
  global.db.data.users[m.sender].Subs = new Date() * 1
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']
export default handler

export async function yukiJadiBot(options) {
  const { pathYukiJadiBot, m, conn } = options
  const mcode = true
  const rtx2 = "Buenas baby, ¿como está el día de hoy?\n\n¡Como vincular un subbot!\n\n🎀 : Más opciones\n🦢 : Dispositivos vinculados\n🪽 : Vincular nuevo dispositivo\n🌸 : Con número\n\n> LOVELLOUD Official"

  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true })

  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (options.args[0]) {
    try {
      const creds = JSON.parse(Buffer.from(options.args[0], "base64").toString("utf-8"))
      fs.writeFileSync(pathCreds, JSON.stringify(creds, null, "\t"))
    } catch {
      return
    }
  }

  let { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)
  const msgRetry = () => { }
  const msgRetryCache = new NodeCache()

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    msgRetry,
    msgRetryCache,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '110.0.5585.95'],
    generateHighQualityLinkPreview: true
  })

  sock.isInit = false
  let isInit = true

  if (mcode) {
    try {
      let code = await sock.requestPairingCode(m.sender.split("@")[0])
      code = code.match(/.{1,4}/g)?.join("-") || "ERROR"
      await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m, ...rcanal })
      await m.reply(code)
    } catch { }
  }

  async function connectionUpdate(update) {
    const { connection, lastDisconnect } = update
    const reason = lastDisconnect?.error?.output?.statusCode || 0

    if (connection === "close") {
      if ([428, 408, 500, 515].includes(reason)) {
        console.log(chalk.bold.yellow(`[SUB-BOT] Conexión perdida (${path.basename(pathYukiJadiBot)}), reconectando...`))
        await creloadHandler(true)
      }
      if ([401, 405, 440, 403].includes(reason)) {
        console.log(chalk.bold.red(`[SUB-BOT] Sesión inválida o cerrada manualmente (${path.basename(pathYukiJadiBot)}), eliminando...`))
        try { fs.rmSync(pathYukiJadiBot, { recursive: true, force: true }) } catch { }
      }
    }

    if (connection === "open") {
      const name = sock.authState.creds.me?.name || "SubBot"
      console.log(chalk.bold.greenBright(`🟢 SubBot conectado: ${name} (+${path.basename(pathYukiJadiBot)})`))
      global.conns.push(sock)
      sock.isInit = true
    }
  }

  sock.ev.on("connection.update", connectionUpdate)
  sock.ev.on("creds.update", saveCreds)

  const creloadHandler = async (restart) => {
    if (restart) {
      try { sock.ws?.close() } catch { }
      sock.ev.removeAllListeners()
    }
    isInit = false
  }

  setInterval(() => {
    if (!sock.user) {
      try { sock.ws?.close() } catch { }
      sock.ev.removeAllListeners()
      let i = global.conns.indexOf(sock)
      if (i >= 0) global.conns.splice(i, 1)
    }
  }, 60000)
}
