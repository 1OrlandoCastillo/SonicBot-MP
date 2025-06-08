const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys');

import moment from 'moment-timezone';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from "qrcode";
import fs from "fs";
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws;
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';

if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn: star, args, usedPrefix, command, isOwner }) => {
  let parent = await global.conn;

  if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == parent.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`);
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0];
    if (!fs.existsSync("./serbot/" + authFolderB)) {
      fs.mkdirSync("./serbot/" + authFolderB, { recursive: true });
    }
    if (args[0]) {
      fs.writeFileSync("./serbot/" + authFolderB + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
    }

    const { state, saveState, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`);
    const msgRetryCounterMap = (MessageRetryMap) => { };
    const msgRetryCounterCache = new NodeCache();
    const { version } = await fetchLatestBaileysVersion();

    let phoneNumber = m.sender.split('@')[0];

    const methodCodeQR = process.argv.includes("qr");
    const methodCode = !!phoneNumber || process.argv.includes("code");
    const MethodMobile = process.argv.includes("mobile");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

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
        let jid = jidNormalizedUser(clave.remoteJid);
        let msg = await store.loadMessage(jid, clave.id);
        return msg?.message || "";
      },
      msgRetryCounterCache,
      msgRetryCounterMap,
      defaultQueryTimeoutMs: undefined,
      version
    };

    let conn = makeWASocket(connectionOptions);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = Infinity;
    let isInit = true;

    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let handlerRef = await import('../handler.js');

    async function reconnectWithBackoff() {
      reconnectAttempts++;
      const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts);
      console.log(`[${authFolderB}] Intentando reconectar #${reconnectAttempts} en ${delay}ms...`);
      await sleep(delay);

      try {
        try { conn.ws?.close(); } catch { }

        conn = makeWASocket(connectionOptions);

        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);

        conn.handler = handlerRef.handler.bind(conn);
        conn.connectionUpdate = connectionUpdate.bind(conn);
        conn.credsUpdate = saveCreds.bind(conn, true);

        conn.ev.on('messages.upsert', conn.handler);
        conn.ev.on('connection.update', conn.connectionUpdate);
        conn.ev.on('creds.update', conn.credsUpdate);

        reconnectAttempts = 0;
        console.log(`[${authFolderB}] Reconexión exitosa!`);
        return true;

      } catch (error) {
        console.error(`[${authFolderB}] Error reconectando:`, error);
        return reconnectWithBackoff();
      }
    }

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update;
      if (isNewLogin) conn.isInit = true;

      const code = lastDisconnect?.error?.output?.statusCode;

      if (code && code !== DisconnectReason.loggedOut) {
        if (conn.ws.socket == null || connection === 'close' || connection === 'connecting') {
          console.log(`[${authFolderB}] Conexión perdida. Intentando reconectar...`);

          const i = global.conns.indexOf(conn);
          if (i >= 0) global.conns.splice(i, 1);

          await reconnectWithBackoff();
          return;
        }
      }

      if (connection === 'open') {
        console.log(`[${authFolderB}] Conexión abierta y establecida`);
        if (!global.conns.includes(conn)) global.conns.push(conn);
        reconnectAttempts = 0;

        await parent.reply(m.chat, args[0] ? 'Conectado con éxito' : 'Conectado exitosamente con WhatsApp\n\n*Nota:* Esto es temporal\nSi el Bot principal se reinicia o se desactiva, todos los sub bots también lo harán\n\nEl número del bot puede cambiar, guarda este enlace:\n*-* https://whatsapp.com/channel/0029VaBfsIwGk1FyaqFcK91S', m, rcanal);
        await sleep(5000);
        if (args[0]) return;
        await parent.reply(conn.user.jid, `La siguiente vez que se conecte envía el siguiente mensaje para iniciar sesión sin utilizar otro código`, m, rcanal);
        await parent.sendMessage(conn.user.jid, {
          text: usedPrefix + command + " " + Buffer.from(fs.readFileSync("./serbot/" + authFolderB + "/creds.json"), "utf-8").toString("base64")
        }, { quoted: m });
      }

      if (connection === 'close') {
        console.log(`[${authFolderB}] Conexión cerrada. Intentando reconectar...`);
        await reconnectWithBackoff();
      }

      if (qr) {
        // Aquí puedes mostrar el QR si quieres
      }
    }

    if (methodCode && !conn.authState.creds.registered) {
      if (!phoneNumber) process.exit(0);

      let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
        process.exit(0);
      }

      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(cleanedNumber);
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;

        let txt = `✿ *Vincula tu cuenta usando el código.*\n\n`;
        txt += `[ ✰ ] Sigue las instrucciones:\n`;
        txt += `*» Más opciones*\n`;
        txt += `*» Dispositivos vinculados*\n`;
        txt += `*» Vincular nuevo dispositivo*\n`;
        txt += `*» Vincular usando número*\n\n`;
        txt += `> *Nota:* Este Código solo funciona en el número que lo solicitó`;

        let sendTxt = await star.reply(m.chat, txt, m, rcanal);
        let sendCode = await star.reply(m.chat, codeBot, m, rcanal);

        setTimeout(() => {
          star.sendMessage(m.chat, { delete: sendTxt });
          star.sendMessage(m.chat, { delete: sendCode });
        }, 30000);

        rl.close();
      }, 3000);
    }

    conn.isInit = false;

    const timeoutId = setTimeout(() => {
      if (!conn.user) {
        try { conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        let i = global.conns.indexOf(conn);
        if (i >= 0) {
          global.conns.splice(i, 1);
        }
        fs.rmdirSync(`./serbot/${authFolderB}`, { recursive: true });
      }
    }, 30000);

    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handlerRef = Handler;
       } catch (e) {
        console.error(e);
      }
      if (restatConn) {
        try { conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
        isInit = true;
      }

      if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
      }

      conn.handler = handlerRef.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds.bind(conn, true);

      conn.ev.on('messages.upsert', conn.handler);
      conn.ev.on('connection.update', conn.connectionUpdate);
      conn.ev.on('creds.update', conn.credsUpdate);

      isInit = false;
      return true;
    };

    await creloadHandler(false);
  }

  serbot();
};

handler.help = ['code'];
handler.tags = ['serbot'];
handler.command = ['code', 'codebot'];
handler.rowner = false;

export default handler;
