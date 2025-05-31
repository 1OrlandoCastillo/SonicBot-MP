import { promises } from 'fs'

const filePath = './database/personalize.json';

let handler = async (m, { conn }) => {
    try {
        const data = JSON.parse(fs.readFileSync(filePath));

        // Cargar datos globales y predeterminados
        const globalConfig = data.global;
        const defaultConfig = data.default;

        const botname = globalConfig.botname || defaultConfig.botname;

let tags = {
  'owner': '• Creador',
}

const menuMessage = `
 • Hola soy ${botname}

*﹙ ✿ ﹚Principal*
https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M
*﹙ ✿ ﹚Secundario*
https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13
`;

let img = 'https://telegra.ph/file/72f984396bb1db415d153.jpg'
    
   await conn.sendFile(m.chat, img, 'thumbnail.jpg', text.trim(), m)

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    throw e
  }
}

handler.command = ['menu', 'help', 'menú'] 

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
let horas = Math.floor(ms / 3600000)
let minutos = Math.floor(ms / 60000) % 60
let segundos = Math.floor(ms / 1000) % 60
  console.log({ ms, horas, minutos, segundos })
return [horas, minutos, segundos].map((v) => v.toString().padStart(2, 0)).join(":")
}
