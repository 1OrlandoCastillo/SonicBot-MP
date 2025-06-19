const { fetchLatestBaileysVersion, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import NodeCache from 'node-cache'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = m.sender.split('@')[0]
  let folder = `./serbot/${user}`
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

  let keysFolder = path.join(folder, 'keys')
  if (!fs.existsSync(keysFolder)) fs.mkdirSync(keysFolder, { recursive: true })

  if (args[0]) {
    fs.writeFileSync(`${folder}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'))
  } else {
    const credsPath = `${folder}/creds.json`
    if (!fs.existsSync(credsPath)) fs.writeFileSync(credsPath, '{}')
  }

  const { state, saveCreds } = await useMultiFileAuthState(folder)
  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCounterCache = new NodeCache()

  let sock
  const connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'fatal' })),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    getMessage: async () => ''
  }

  let isInit = true
  const startSocket = () => {
    sock = makeWASocket(connectionOptions)
    sock.handler = handlerModule.handler?.bind(sock)
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    bindHandlers()
  }

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    if (isNewLogin) sock.isInit = true

    if (qr) {
      let qrText = '✦ 𝑺𝑬𝑹𝑩𝑶𝑻 - 𝑺𝑼𝑩𝑩𝑶𝑻 ✦\n\n'
      qrText += '┌  ✩  *Escanea este QR para conectarte como Sub Bot*\n'
      qrText += '│  ✩  Pasos:\n'
      qrText += '│  ✩  *1* : Click en los 3 puntos\n'
      qrText += '│  ✩  *2* : Dispositivos vinculados\n'
      qrText += '└  ✩  *3* : Escanea este código QR\n\n'
      qrText += '> *Nota:* Este código QR expira en 30 segundos.'

      let qrImg = await qrcode.toDataURL(qr, { scale: 8 })
      let msgQR = await conn.sendFile(m.chat, qrImg, 'qrcode.png', qrText, m)
      setTimeout(() => conn.sendMessage(m.chat, { delete: msgQR.key }), 30000)
    }

    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    const shouldReconnect = code !== DisconnectReason.loggedOut

    if (connection === 'close') {
      console.log(`[CONNECTION] Cerrado con código ${code} | Reintentar: ${shouldReconnect}`)
      if (shouldReconnect) {
        reconnectLoop()
      } else {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
        if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true })
      }
    }

    if (connection === 'open') {
      sock.isInit = true
      global.conns.push(sock)

      await conn.reply(m.chat, args[0]
        ? '✅ Conectado con éxito'
        : '✅ Sub Bot conectado exitosamente\n\n📌 *Nota:* Esta sesión es temporal.\nSi el bot principal se reinicia o apaga, esta sesión también lo hará.\n\n🔗 Guarda este enlace: https://whatsapp.com/channel/0029VaBfs3wek1Ffaq5cK91S',
        m)

      if (!args[0]) {
        await sleep(5000)
        try {
          let jid = sock?.user?.id || sock?.user?.jid
          if (jid) {
            const codeText = `${usedPrefix}${command} ${Buffer.from(fs.readFileSync(`${folder}/creds.json`), 'utf-8').toString('base64')}`

            await sock.sendMessage(jid, {
              text: '🔄 Para reconectar sin QR ni código, responde con este mensaje:'
            })

            await sock.sendMessage(jid, {
              text: codeText
            })
          } else {
            console.warn('[WARN] No se pudo obtener el jid del subbot para enviar código.')
          }
        } catch (e) {
          console.error('[ERROR ENVIANDO CÓDIGO DE RECONEXIÓN]', e)
        }
      }
    }
  }

  async function reconnectLoop(retry = 0) {
    console.log(`[RECONNECT] Intento #${retry + 1}`)
    try {
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions)
      bindHandlers()
    } catch (e) {
      console.error('[RECONNECT ERROR]', e)
      setTimeout(() => reconnectLoop(retry + 1), 5000)
    }
  }

  function bindHandlers() {
    sock.ev.on('connection.update', connectionUpdate)
    sock.ev.on('messages.upsert', sock.handler)
    sock.ev.on('creds.update', sock.credsUpdate)
  }

  const methodCode = !!m.sender
  if (methodCode && !sock?.authState?.creds?.registered) {
    let phone = m.sender.split('@')[0]
    let cleaned = phone.replace(/\D/g, '')
    if (!Object.keys(PHONENUMBER_MCC || {}).some(v => cleaned.startsWith(v))) return

    setTimeout(async () => {
      let pairingCode = await sock.requestPairingCode(cleaned)
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode

      let txt = `✿ *Vincula tu cuenta usando el siguiente código*\n\n`
      txt += `[ ✰ ] Instrucciones:\n`
      txt += `*» Más opciones*\n`
      txt += `*» Dispositivos vinculados*\n`
      txt += `*» Vincular nuevo dispositivo*\n`
      txt += `*» Vincular usando número*\n\n`
      txt += `> *Nota:* Este código solo funciona para el número que lo solicitó.`

      let msg1 = await conn.reply(m.chat, txt, m)
      let msg2 = await conn.reply(m.chat, pairingCode, m)
      setTimeout(() => {
        conn.sendMessage(m.chat, { delete: msg1.key })
        conn.sendMessage(m.chat, { delete: msg2.key })
      }, 30000)
    }, 3000)
  }

  let handlerModule = await import('../handler.js')
  async function creloadHandler(restartConn) {
    try {
      let updated = await import(`../handler.js?update=${Date.now()}`)
      if (updated && typeof updated === 'object' && Object.keys(updated).length > 0) {
        handlerModule = updated
      }
    } catch (e) { console.error(e) }

    if (restartConn) {
      try { sock.ws.close() } catch {}
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions)
      isInit = true
    }

    if (!isInit) {
      sock.ev.off('messages.upsert', sock.handler)
      sock.ev.off('connection.update', sock.connectionUpdate)
      sock.ev.off('creds.update', sock.credsUpdate)
    }

    sock.handler = handlerModule.handler?.bind(sock)
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)

    bindHandlers()
    isInit = false
    return true
  }

  startSocket()
  creloadHandler(false)
}

handler.help = ['code', 'qr', 'serbot']
handler.tags = ['serbot']
handler.command = ['code', 'codebot', 'qr', 'serbot', 'jadibot', 'qrbot']
handler.rowner = false

export default handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
