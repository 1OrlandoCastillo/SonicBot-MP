import { promises as fs } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import { xpRange } from '../lib/levelling.js';

const tags = {
  owner: '• Creador',
  serbot: '• Subs - Bots',
};

const defaultMenu = {
  before: `
• ${namebot} Channels

*﹙ ✿ ﹚Principal*
https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M
*﹙ ✿ ﹚Secundario* 
https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13
%readmore`.trimStart(),

  header: '「 *`%category`* 」',
  body: '❏%cmd %islimit %isPremium\n',
  footer: '',
  after: '',
};

const handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    // Obtener información del paquete
    const _package = JSON.parse(
      await fs.readFile(join(__dirname, '../package.json')).catch(() => '{}')
    ) || {};

    // Datos del usuario
    const { exp, limit, level } = global.db.data.users[m.sender];
    const { min, xp, max } = xpRange(level, global.multiplier);
    const name = await conn.getName(m.sender);

    // Fechas y tiempos
    const d = new Date(Date.now() + 3600000);
    const locale = 'es';
    const weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5];
    const week = d.toLocaleDateString(locale, { weekday: 'long' });
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    const dateIslamic = new Intl.DateTimeFormat(`${locale}-TN-u-ca-islamic`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    const time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

    // Tiempos de actividad
    const _uptime = process.uptime() * 1000;
    let _muptime;
    if (process.send) {
      process.send('uptime');
      _muptime = await new Promise((resolve) => {
        process.once('message', resolve);
        setTimeout(() => resolve(_uptime), 1000);
      }) * 1;
    }

    const uptime = clockString(_uptime);
    const muptime = clockString(_muptime);

    // Datos generales
    const totalreg = Object.keys(global.db.data.users).length;
    const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length;

    // Ayuda
    const help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
      prefix: 'customPrefix' in plugin,
      limit: plugin.limit,
      premium: plugin.premium,
      enabled: !plugin.disabled,
    }));

    // Añadir nuevas categorías
    for (let plugin of help) {
      if (plugin && plugin.tags) {
        for (let tag of plugin.tags) {
          if (!(tag in tags) && tag) {
            tags[tag] = tag;
          }
        }
      }
    }

    // Construcción del texto del menú
    const menuConfig = conn.menu || defaultMenu;
    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu => {
            return menu.help.map(helpText => {
              return menuConfig.body
                .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                .trim();
            }).join('\n');
          }).join('\n'),
          menuConfig.footer,
        ].join('\n');
      }),
      conn.user.jid === global.conn.user.jid ? '' : '',
      menuConfig.after
    ].join('\n');

    // Variables para reemplazo
    const replace = {
      '%': '%',
      p: _p,
      uptime,
      muptime,
      taguser: '@' + m.sender.split('@')[0],
      wasp: '@0',
      me: conn.getName(conn.user.jid),
      npmname: _package.name,
      version: _package.version,
      npmdesc: _package.description,
      npmmain: _package.main,
      author: _package.author?.name,
      license: _package.license,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: _package.homepage?.url || '[unknown github url]',
      greeting,
      level,
      limit,
      name,
      weton,
      week,
      date,
      dateIslamic,
      time,
      totalreg,
      rtotalreg,
      readmore: readMore,
    };

    let text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    );

    const img = `./storage/img/menu.jpg`;

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', text.trim(), m, null, rcanal);

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m);
    throw e;
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;

// Utilidades
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

// Mensaje de saludo según la hora
const ase = new Date();
let hour = ase.getHours();
const greetingMap = {
  0: 'una linda noche 🌙',
  1: 'una linda noche 💤',
  2: 'una linda noche 🦉',
  3: 'una linda mañana ✨',
  4: 'una linda mañana 💫',
  5: 'una linda mañana 🌅',
  6: 'una linda mañana 🌄',
  7: 'una linda mañana 🌅',
  8: 'una linda mañana 💫',
  9: 'una linda mañana ✨',
  10: 'un lindo día 🌞',
  11: 'un lindo día 🌨',
  12: 'un lindo día ❄',
  13: 'un lindo día 🌤',
  14: 'una linda tarde 🌇',
  15: 'una linda tarde 🥀',
  16: 'una linda tarde 🌹',
  17: 'una linda tarde 🌆',
  18: 'una linda noche 🌙',
  19: 'una linda noche 🌃',
  20: 'una linda noche 🌌',
  21: 'una linda noche 🌃',
  22: 'una linda noche 🌙',
  23: 'una linda noche 🌃',
};

var greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día');
