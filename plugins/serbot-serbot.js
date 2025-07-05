const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import util from "util";
import * as ws from "ws";
const { child, spawn, exec } = await import("child_process");
const { CONNECTING } = ws;
import { makeWASocket } from "../lib/simple.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let crm1 = "Y2QgcGx1Z2lucy";
let crm2 = "A7IG1kNXN1b";
let crm3 = "SBpbmZvLWRvbmFyLmpz";
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz";
let drm1 = "";
let drm2 = "";

let rtx = "✿ *Vincula tu cuenta usando el qr:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con qr*\n\n> *Qr válido solo para este número.*";
let rtx2 = "✿ *Vincula tu cuenta usando el código:*\n\n*Más opciones → Dispositivos vinculados → Vincular nuevo dispositivo → Con número*\n\n> *Código válido solo para este número.*";

const yukiJBOptions = {};
if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  let time = global.db.data.users[m.sender].Subs + 120000;

  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])];
  const subBotsCount = subBots.length;

  if (subBotsCount === 20) return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`);

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let id = `${who.split`@`[0]}`;
  let pathYukiJadiBot = path.join(`./${jadi}/`, id);

  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true });

  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot;
  yukiJBOptions.m = m;
  yukiJBOptions.conn = conn;
  yukiJBOptions.args = args;
  yukiJBOptions.usedPrefix = usedPrefix;
  yukiJBOptions.command = command;
  yukiJBOptions.fromCommand = true;

  yukiJadiBot(yukiJBOptions);
  global.db.data.users[m.sender].Subs = new Date * 1;
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];
export default handler;

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options;

  if (command === 'code') {
    command = 'qr';
    args.unshift('code');
  }

  const mcode = args[0]?.trim()?.match(/--code|code/) ? true : args[1]?.trim()?.match(/--code|code/) ? true : false;

  if (mcode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    args[1] = args[1]?.replace(/^--code$|^code$/, "").trim();
  }

  const pathCreds = path.join(pathYukiJadiBot, "creds.json");
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true });

  try {
    if (args[0]) fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
  } catch {
    conn.reply(m.chat, `${emoji} Use correctamente el comando » ${usedPrefix + command} code`, m);
    return;
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64");
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`);
    let { version } = await fetchLatestBaileysVersion();
    const msgRetry = (MessageRetryMap) => {};
    const msgRetryCache = new NodeCache();
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot);

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou (Sub Bot)', 'Chrome', '2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);
    sock.isInit = false;
    let isInit = true;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update;

      if (isNewLogin) sock.isInit = false;

      if (qr && !mcode) {
        if (m?.chat) {
          const txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m });
          if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000);
        }
        return;
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]));
        secret = secret.match(/.{1,4}/g)?.join("-");
        const txtCode = await conn.sendMessage(m.chat, text: rtx2, m, rcanal);
        const codeBot = await m.reply(secret);

        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000);
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000);
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (connection === 'close') {
        switch (reason) {
          case 428:
          case 408:
          case 500:
          case 515:
            console.log(chalk.bold.magentaBright(`\n┆ Reconectando sesión: +${path.basename(pathYukiJadiBot)}...`));
            await creloadHandler(true).catch(console.error);
            break;
          case 440:
          case 405:
          case 401:
            console.log(chalk.bold.magentaBright(`\n┆ Sesión inválida o cerrada: +${path.basename(pathYukiJadiBot)}.`));
            try {} catch (e) {}
            fs.rmdirSync(pathYukiJadiBot, { recursive: true });
            break;
          case 403:
            fs.rmdirSync(pathYukiJadiBot, { recursive: true });
            break;
        }
      }

      if (connection === 'open') {
        if (!global.db.data?.users) loadDatabase();
        const userName = sock.authState.creds.me.name || 'Anónimo';
        console.log(chalk.bold.cyanBright(`\n❒ SUB-BOT CONECTADO: ${userName} (+${path.basename(pathYukiJadiBot)})`));
        sock.isInit = true;
        global.conns.push(sock);
        await joinChannels(sock);
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close(); } catch (e) {}
        sock.ev.removeAllListeners();
        let i = global.conns.indexOf(sock);
        if (i < 0) return;
        delete global.conns[i];
        global.conns.splice(i, 1);
      }
    }, 60000);

    let handler = await import('../handler.js');

    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
      } catch (e) {
        console.error('Nuevo error: ', e);
      }

      if (restatConn) {
        const oldChats = sock.chats;
        try { sock.ws.close(); } catch {}
        sock.ev.removeAllListeners();
        sock = makeWASocket(connectionOptions, { chats: oldChats });
        isInit = true;
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler);
        sock.ev.off("connection.update", sock.connectionUpdate);
        sock.ev.off('creds.update', sock.credsUpdate);
      }

      sock.handler = handler.handler.bind(sock);
      sock.connectionUpdate = connectionUpdate.bind(sock);
      sock.credsUpdate = saveCreds.bind(sock, true);
      sock.ev.on("messages.upsert", sock.handler);
      sock.ev.on("connection.update", sock.connectionUpdate);
      sock.ev.on("creds.update", sock.credsUpdate);
      isInit = false;
      return true;
    }

    creloadHandler(false);
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' m y ' + seconds + ' s ';
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {});
  }
}
