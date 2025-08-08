import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    const configPath = join('./Serbot', botActual, 'config.json')
    let nombreBot = global.namebot || 'Satsuki'
    let imgBot = './storage/img/menu3.jpg'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
        if (config.img) imgBot = config.img
      } catch {}
    }
    
    let totalf = Object.values(global.plugins).filter(v => v.help && v.tags).length

const text = `
︶•︶°︶•︶°︶•︶°︶•︶°︶•︶°︶
> 𝗛ola! Soy ${nombreBot} (｡•̀ᴗ-)✧

╭┈──────────
│ᰔᩚ *Modo* » Privado
│☕︎ *Plugins* » ${totalf}
│🜸 *Baileys* » Multi Device
╰───────────

╭─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜
> ✿ Crea un *Sub-Bot* con tu número utilizando *#qr* o *#code*
╰ׅ─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜
`.trim()

    await conn.sendMessage(m.chat, {
      text,
      contextInfo: {
        externalAdReply: {
          title: `Yuki Hot`,
          body: "Yuki, mᥲძᥱ ᥕі𝗍һ ᑲᥡ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ,",
          sourceUrl: "",
          thumbnail: fs.readFileSync(imgBot),
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        },
        mentionedJid: [m.sender]
      }
    }, { quoted: m })

  } catch (e) {
    console.error('Error al mostrar menú:', e)
    conn.sendMessage(m.chat, {
      text: 'Lo sentimos, hubo un error al mostrar el menú.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
    throw e
  }
}

handler.command = ['xc']
export default handler