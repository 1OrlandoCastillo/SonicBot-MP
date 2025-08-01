const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import util from "util"
import * as ws from "ws"
const { child, spawn, exec } = await import("child_process")
const { CONNECTING } = ws
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"


const rcanal = global.rcanal || {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363403143798163@newsletter',
      serverMessageId: 100,
      newsletterName: 'LOVELLOUD Official Channel'
    }
  }
}

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AYBotOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (m.isGroup) {
    return m.reply('*[❗] Para convertirte en Sub-Bot usa el comando en privado del bot.*')
  }
  
  let time = global.db.data.users[m.sender].Subs + 120000
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length

  if (subBotsCount === 20) {
    return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathAYBot = path.join(`./${global.bot}/`, id)
  if (!fs.existsSync(pathAYBot)) {
    fs.mkdirSync(pathAYBot, { recursive: true })
  }

  AYBotOptions.pathAYBot = pathAYBot
  AYBotOptions.m = m
  AYBotOptions.conn = conn
  AYBotOptions.args = args
  AYBotOptions.usedPrefix = usedPrefix
  AYBotOptions.command = command
  AYBotOptions.fromCommand = true

  AYBot(AYBotOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['#qr', '#code']
handler.tags = ['subbots']
handler.command = ['qr', 'code']
export default handler

export async function AYBot(options) {
  let { pathAYBot, m, conn, args, usedPrefix, command, fromCommand = true } = options
  
 
  if (!fromCommand) {
    command = 'qr'
    args = []
    usedPrefix = '.'
  }
  
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  let txtCode, codeBot, txtQR

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathAYBot, "creds.json")
  if (!fs.existsSync(pathAYBot)) {
    fs.mkdirSync(pathAYBot, { recursive: true })
  }

  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    if (m && conn) {
      conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮
│
╰➺ ✧ *Uso correcto del comando:*
╰➺ ✧ *${usedPrefix + command} code*
╰➺ ✧ *${usedPrefix + command}*
│
╰➺ ✧ *Ejemplos:*
╰➺ ✧ .code - Para código de vinculación
╰➺ ✧ .qr - Para código QR
│
╰────────────────╯
> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
   
    process.on('unhandledRejection', (reason, promise) => {
      console.log(chalk.bold.redBright(`\n┆ Unhandled Rejection at: ${promise}, reason: ${reason}\n`))
    })
    const drmer = Buffer.from(drm1 + drm2, "base64")
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    let state, saveState, saveCreds
    try {
      const authState = await useMultiFileAuthState(pathAYBot)
      state = authState.state
      saveState = authState.saveState
      saveCreds = authState.saveCreds
    } catch (error) {
      console.log(chalk.bold.redBright(`\n┆ Error inicializando auth state para ${path.basename(pathAYBot)}: ${error.message}\n`))
      return
    }

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Anya Forger (Sub Bot)', 'Chrome', '2.0.0'],
      version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode && m && conn) {
        let txt = `╭─「 ✦ 𓆩📱𓆪 ᴠɪɴᴄᴜʟᴀᴄɪᴏ́ɴ ǫʀ ✦ 」─╮
│
╰➺ ✧ *Escaneo de QR requerido*
│
╰➺ ✧ *Ruta para vincular:*
╰➺ ✧ • Aplicación: WhatsApp
╰➺ ✧ • Menú: Más opciones (⋮)
╰➺ ✧ • Módulo: Dispositivos vinculados
╰➺ ✧ • Acción: Vincular nuevo dispositivo
╰➺ ✧ • Método: Escanear código QR
│
╰➺ ✧ *Nota:*
╰➺ ✧ Este código QR caduca en 30 segundos
╰➺ ✧ Escanea con calma y estilo
│
╰────────────────╯
> LOVELLOUD Official`

        let sendQR = await conn.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), "qrcode.png", txt, m, null, rcanal)

        setTimeout(() => {
          conn.sendMessage(m.chat, { delete: sendQR.key })
        }, 30000)

        return
      }

      if (qr && mcode && m && conn) {
        let secret = await sock.requestPairingCode(m.sender.split`@`[0])
        secret = secret?.match(/.{1,4}/g)?.join("-") || secret
        
        let txt = `╭─「 ✦ 𓆩🔢𓆪 ᴠɪɴᴄᴜʟᴀᴄɪᴏ́ɴ ᴄᴏ́ᴅɪɢᴏ ✦ 」─╮
│
╰➺ ✧ *Vinculación requerida*
│
╰➺ ✧ *Ruta para conectar:*
╰➺ ✧ • Aplicación: WhatsApp
╰➺ ✧ • Menú: Más opciones (⋮)
╰➺ ✧ • Módulo: Dispositivos vinculados
╰➺ ✧ • Acción: Vincular nuevo dispositivo
╰➺ ✧ • Método: Vincular usando número
│
╰➺ ✧ *Nota:*
╰➺ ✧ Este código es temporal
╰➺ ✧ Válido solo para tu número
╰➺ ✧ Caduca en 30 segundos
│
╰────────────────╯
> LOVELLOUD Official`
        
        let sendTxt = await conn.sendMessage(m.chat, {
          text: txt,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })

        let sendCode = await conn.sendMessage(m.chat, {
          text: `${secret}`,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })

        setTimeout(() => {
          conn.sendMessage(m.chat, { delete: sendTxt.key })
          conn.sendMessage(m.chat, { delete: sendCode.key })
        }, 30000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try { sock.ws.close() } catch { }
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i >= 0) {
            delete global.conns[i]
            global.conns.splice(i, 1)
          }
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (connection === 'close') {
        if ([428, 408, 515].includes(reason)) {
          console.log(chalk.bold.magentaBright(`\n┆ Subbot (+${path.basename(pathAYBot)}) desconectado (${reason}). Intentando reconectar...\n`))
          await creloadHandler(true).catch(console.error)
        }

              if ([405, 401].includes(reason)) {
        console.log(chalk.bold.magentaBright(`\n┆ Sesión inválida o cerrada manualmente. (+${path.basename(pathAYBot)})\n`))
        try {
          if (fs.existsSync(pathAYBot)) {
            fs.rmdirSync(pathAYBot, { recursive: true })
          }
        } catch (error) {
          console.log(chalk.bold.redBright(`\n┆ Error eliminando carpeta ${pathAYBot}: ${error.message}\n`))
        }
      }

        if (reason === 440 || reason === 403) {
          console.log(chalk.bold.magentaBright(`\n┆ Sesión reemplazada o en soporte. Eliminando carpeta...\n`))
          try {
            if (fs.existsSync(pathAYBot)) {
              fs.rmdirSync(pathAYBot, { recursive: true })
            }
          } catch (error) {
            console.log(chalk.bold.redBright(`\n┆ Error eliminando carpeta ${pathAYBot}: ${error.message}\n`))
          }
        }

        if (reason === 500) {
          console.log(chalk.bold.magentaBright(`\n┆ Conexión perdida. Eliminando sesión...\n`))
          return creloadHandler(true).catch(console.error)
        }
      }

      if (global.db.data == null) loadDatabase()

      if (connection === 'open') {
        if (!global.db.data?.users) loadDatabase()
        let userName = sock.authState.creds.me.name || 'Anónimo'
        let userJid = sock.authState.creds.me.jid || `${path.basename(pathAYBot)}@s.whatsapp.net`

        console.log(chalk.bold.cyanBright(`\n🟢 ${userName} (+${path.basename(pathAYBot)}) conectado exitosamente.`))
        sock.isInit = true
        sock.startTime = Date.now() 
        global.conns.push(sock)
        await joinChannels(sock)
        
       
                try {
          const botNumber = path.basename(pathAYBot)
          const configPath = path.join(pathAYBot, 'config.json')
          let nombreBot = global.namebot || 'KIYOMI MD'
          
          if (fs.existsSync(configPath)) {
            try {
              const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
              if (config.name) nombreBot = config.name
            } catch (err) {}
          } else {
            
            const defaultConfig = {
              name: nombreBot,
              autoRead: false  
            }
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
          }
          
          const welcomeMessage = `╭─「 ✦ 𓆩🎉𓆪 ʙɪᴇɴᴠᴇɴɪᴅᴏ ✦ 」─╮
│
╰➺ ✧ *¡Felicidades!* 🎊
╰➺ ✧ *Te has convertido en un Sub-Bot exitosamente*
│
╭─「 ✦ 𓆩🤖𓆪 ɪɴғᴏ ᴅᴇʟ sᴜʙ-ʙᴏᴛ ✦ 」─╮
│
╰➺ ✧ *Nombre:* ${nombreBot}
╰➺ ✧ *Número:* +${botNumber}
╰➺ ✧ *Usuario:* ${userName}
╰➺ ✧ *Estado:* Conectado ✅
╰➺ ✧ *Auto-leer:* Desactivado ❌
│
╰────────────────╯
│
╰➺ ✧ *Comandos de configuración:*
╰➺ ✧ *.setautoread on* - Activar auto-leer
╰➺ ✧ *.setautoread off* - Desactivar auto-leer
│
╰────────────────╯
> LOVELLOUD Official`

          
          
          if (m && conn) {
            await conn.sendMessage(m.chat, {
              text: welcomeMessage,
              contextInfo: {
                ...rcanal.contextInfo
              }
            })
          }
          
        } catch (error) {
          console.error('Error enviando mensaje de bienvenida:', error)
        }
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Nuevo error: ', e)
      }

      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
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
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
  if (!global.ch) return
  
  for (const channelId of Object.values(global.ch)) {
    try {

      if (typeof conn.newsletterFollow === 'function') {
        await conn.newsletterFollow(channelId).catch(console.error)
      }
    } catch (e) {
      console.error('Error al seguir el canal:', channelId, e)
    }
  }
}
