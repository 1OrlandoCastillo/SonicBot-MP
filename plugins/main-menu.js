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

const defaultMenu = {
  before: `
 • Hola soy ${botname}

*﹙ ✿ ﹚Principal*
https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M
*﹙ ✿ ﹚Secundario*
https://whatsapp.com/channel/0029Vb3oShrICVfiTWhDHM13
%readmore
\t\t\t
`.trimStart(),
  header: '┌─ 「  *`%category`*  」', 
  body: '┃❏%cmd %islimit %isPremium\n',
  footer: '╰─────────────',
  after: ``,
}

let img = 'https://telegra.ph/file/72f984396bb1db415d153.jpg'
    
   await conn.sendFile(m.chat, img, 'thumbnail.jpg', text.trim(), m, null, rcanal)

  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    throw e
  }
}

handler.command = ['menu', 'help', 'menú'] 
export default handler
