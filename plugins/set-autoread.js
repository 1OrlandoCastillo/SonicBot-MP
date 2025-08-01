import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  let nombreBot = global.namebot || 'Anya Forger'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {}
  }

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, `¿Hola, cómo te va?\n\n* No encontré una sesión activa vinculada a tu número\n\n* Puede que aún no te hayas conectado\n\n* Si deseas iniciar una nueva, estaré aquí para ayudarte\n\n> LOVELLOUD Official`, m, rcanal)
  }

  const configPathUser = path.join(botPath, 'config.json')
  let config = {}

  if (fs.existsSync(configPathUser)) {
    try {
      config = JSON.parse(fs.readFileSync(configPathUser))
    } catch {}
  }

  
  if (!text) {
    const autoReadStatus = config.autoRead !== false ? 'Activado ✅' : 'Desactivado ❌'
    return conn.reply(m.chat, `╭─「 ✦ 𓆩📖𓆪 ᴀᴜᴛᴏ-ʟᴇᴇʀ ✦ 」─╮
│
╰➺ ✧ *Estado actual:* ${autoReadStatus}
│
╰➺ ✧ *Comandos disponibles:*
╰➺ ✧ *.setautoread on* - Activar auto-leer
╰➺ ✧ *.setautoread off* - Desactivar auto-leer
│
╰➺ ✧ *¿Qué hace el auto-leer?*
╰➺ ✧ Marca automáticamente los mensajes como leídos
╰➺ ✧ Aparece el doble check azul en WhatsApp
│
╰────────────────╯
> LOVELLOUD Official`, m, rcanal)
  }

  const action = text.toLowerCase().trim()

  if (action === 'on' || action === 'activar' || action === 'enable') {
    config.autoRead = true
    await conn.reply(m.chat, `╭─「 ✦ 𓆩✅𓆪 ᴀᴜᴛᴏ-ʟᴇᴇʀ ᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮
│
╰➺ ✧ *Auto-leer:* Activado ✅
╰➺ ✧ *Ahora tu sub-bot marcará automáticamente los mensajes como leídos*
╰➺ ✧ *Aparecerá el doble check azul en todos los chats*
│
╰────────────────╯
> LOVELLOUD Official`, m, rcanal)
  } else if (action === 'off' || action === 'desactivar' || action === 'disable') {
    config.autoRead = false
    await conn.reply(m.chat, `╭─「 ✦ 𓆩❌𓆪 ᴀᴜᴛᴏ-ʟᴇᴇʀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ ✦ 」─╮
│
╰➺ ✧ *Auto-leer:* Desactivado ❌
╰➺ ✧ *Tu sub-bot ya no marcará automáticamente los mensajes como leídos*
╰➺ ✧ *Los mensajes mantendrán el check gris*
│
╰────────────────╯
> LOVELLOUD Official`, m, rcanal)
  } else {
    return conn.reply(m.chat, `╭─「 ✦ 𓆩❓𓆪 ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ ✦ 」─╮
│
╰➺ ✧ *Comandos válidos:*
╰➺ ✧ *.setautoread on* - Activar
╰➺ ✧ *.setautoread off* - Desactivar
╰➺ ✧ *.setautoread* - Ver estado actual
│
╰────────────────╯
> LOVELLOUD Official`, m, rcanal)
  }

  try {
    fs.writeFileSync(configPathUser, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('Error guardando configuración de auto-leer:', error)
    await conn.reply(m.chat, `❌ Error al guardar la configuración. Inténtalo nuevamente.`, m, rcanal)
  }
}

handler.help = ['setautoread <on/off>']
handler.tags = ['serbot']
handler.command = /^setautoread$/i

export default handler 