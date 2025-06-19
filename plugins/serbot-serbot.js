const { fetchLatestBaileysVersion, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import qrcode from 'qrcode'
import readline from 'readline'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import NodeCache from 'node-cache'
import { makeWASocket } from '../lib/simple.js'

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn: parentConn, args, usedPrefix, command }) => {
  let parent = args[0] === 'plz' ? parentConn : await global.conn
  if (!(args[0] === 'plz' || (await global.conn).user.jid === parentConn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}${command}`)
  }

  let user = m.sender.split('@')[0]
  let folder = `./serbot/${user}`
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
  if (args[0]) {
    fs.writeFileSync(`${folder}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'))
  }

  const { state, saveCreds, saveState } = await useMultiFileAuthState(folder)
  const { version } = await fetchLatestBaileysVersion()
  const msgRetryCounterCache = new NodeCache()

  let conn
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
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage?.(jid, key.id)
      return msg?.message || ''
    },
    markOnlineOnConnect: true
  }

  conn = makeWASocket(connectionOptions)
  conn.isInit = false
  let isInit = true

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    if (isNewLogin) conn.isInit = true

    if (qr) {
      let qrText = '✦ 𝑺𝑬𝑹𝑩𝑶𝑻 - 𝑺𝑼𝑩𝑩𝑶𝑻 ✦\n\n'
      qrText += '┌  ✩  *Escanea este QR para conectarte como Sub Bot*\n'
      qrText += '│  ✩  Pasos:\n'
      qrText += '│  ✩  *1* : Click en los 3 puntos\n'
      qrText += '│  ✩  *2* : Dispositivos vinculados\n'
      qrText += '└  ✩  *3* : Escanea este código QR\n\n'
      qrText += '> *Nota:* Este código QR expira en 30 segundos.'

      let qrImg = await qrcode.toDataURL(qr, { scale: 8 })
      let msgQR = await parent.sendFile(m.chat, qrImg, 'qrcode.png', qrText, m)
      setTimeout(() => parent.sendMessage(m.chat, { delete: msgQR.key }), 30000)
    }

    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    const shouldReconnect = code !== DisconnectReason.loggedOut

    if (connection === 'close') {
      if (shouldReconnect) {
        console.log(`[RECONNECT] SubBot desconectado con código ${code}. Intentando reconectar...`)
        reconnect()
      } else {
        console.log('[LOGOUT] SubBot se desconectó permanentemente.')
        try { conn.ws.close() } catch {}
        conn.ev.removeAllListeners()
        let i = global.conns.indexOf(conn)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
        if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true })
      }
    }

    if (connection === 'open') {
      conn.isInit = true
      global.conns.push(conn)

      await parent.reply(m.chat, args[0] ? '✅ Conectado con éxito' : '✅ Sub Bot conectado exitosamente\n\n📌 *Nota:* Esta sesión es temporal.\nSi el bot principal se reinicia o apaga, esta sesión también lo hará.\n\n🔗 Guarda este enlace: https://whatsapp.com/channel/0029VaBfs3wek1Ffaq5cK91S', m)

      if (args[0]) return

      await sleep(5000)
      await parent.reply(conn.user.jid, `🔄 Para reconectar sin QR ni código, responde con este mensaje:`, m)
      await parent.reply(conn.user.jid, `${usedPrefix}${command} ${Buffer.from(fs.readFileSync(`${folder}/creds.json`), 'utf-8').toString('base64')}`, m)
    }
  }

  // Autorreconexión persistente
  async function reconnect() {
    try {
      conn.ev.removeAllListeners()
      conn = makeWASocket(connectionOptions)
      bindHandlers()
    } catch (err) {
      console.error('[FATAL] Error en reconexión:', err)
      setTimeout(reconnect, 10000)
    }
  }

  function bindHandlers() {
    conn.ev.on('connection.update', connectionUpdate)
    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('creds.update', conn.credsUpdate)
  }

  // Código de vinculación
  const methodCode = !!m.sender
  if (methodCode && !conn.authState.creds.registered) {
    let phone = m.sender.split('@')[0]
    let cleaned = phone.replace(/\D/g, '')
    if (!Object.keys(PHONENUMBER_MCC).some(v => cleaned.startsWith(v))) return

    setTimeout(async () => {
      let pairingCode = await conn.requestPairingCode(cleaned)
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode

      let txt = `✿ *Vincula tu cuenta usando el siguiente código*\n\n`
      txt += `[ ✰ ] Instrucciones:\n`
      txt += `*» Más opciones*\n`
      txt += `*» Dispositivos vinculados*\n`
      txt += `*» Vincular nuevo dispositivo*\n`
      txt += `*» Vincular usando número*\n\n`
      txt += `> *Nota:* Este código solo funciona para el número que lo solicitó.`

      let msg1 = await parent.reply(m.chat, txt, m)
      let msg2 = await parent.reply(m.chat, pairingCode, m)
      setTimeout(() => {
        parent.sendMessage(m.chat, { delete: msg1.key })
        parent.sendMessage(m.chat, { delete: msg2.key })
      }, 30000)
    }, 3000)
  }

  let handlerModule = await import('../handler.js')
  let creloadHandler = async function (restartConn) {
    try {
      let updated = await import(`../handler.js?update=${Date.now()}`)
      if (Object.keys(updated || {}).length) handlerModule = updated
    } catch (e) { console.error(e) }

    if (restartConn) {
      try { conn.ws.close() } catch {}
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

    bindHandlers()
    isInit = false
    return true
  }

  conn.handler = handlerModule.handler.bind(conn)
  conn.connectionUpdate = connectionUpdate.bind(conn)
  conn.credsUpdate = saveCreds.bind(conn, true)

  bindHandlers()
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
