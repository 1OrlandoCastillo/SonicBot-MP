import fs from 'fs'
import { join } from 'path'

const defaultMenu = {
  before: `
Hola! soy *%botname*  
(%tipo)


╭─〔 ✦ 𓆩👑𓆪  ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏs ✦ 〕─╮
│  ꒷ꕤ  Dueños del bot:
│
╰➺ +51942501966 (Sung)

╰➺ +51901437507 (Sunkovv)


╭─〔 ✦ 𓆩💎𓆪  ᴄᴀɴᴀʟᴇs ᴏғɪᴄɪᴀʟᴇs ✦ 〕─╮
│  ꒷ꕤ  Accede aquí:
│
╰➺ https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M

╰➺ https://whatsapp.com/channel/0029Vb5Vinf72WTo11c5hJ3O

𝗔𝗾𝘂𝗶 𝘁𝗶𝗲𝗻𝗲𝘀 𝗹𝗮 𝗹𝗶𝘀𝘁𝗮 𝗱𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼𝘀:

%readmore`.trimStart()

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const name = await conn.getName(m.sender)

    let nombreBot = global.namebot || 'Anya Forger'
    let imgBot = './storage/img/menu3.jpg'
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    const configPath = join('./Serbot', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.img) imgBot = config.img
      } catch {}
    }

    const tipo = botActual === '+51958333972'.replace(/\D/g, '') ? 'Principal Bot' : 'Sub Bot'

    const menuConfig = conn.menu || defaultMenu
    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu => {
            return menu.help.map(helpText => {
                .trim()
            }).join('\n')
          }).join('\n'),
          menuConfig.footer
        ].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      tipo,
      readmore: readMore,
    }

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', text.trim(), m, null, rcanal)
  } catch (e) {
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
    throw e
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler
