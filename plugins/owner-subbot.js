import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command, isROwner }) => {
  try {
    if (!isROwner) {
      return conn.sendMessage(m.chat, {
        text: '《✧》Solo los creadores del bot pueden usar este comando.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

    const action = args[0]?.toLowerCase()
    const botNumber = args[1]
    const ownerNumber = args[2]
    const ownerName = args[3]

    if (!action) {
      let txt = `╭─「 ✦ 🤖 ɢᴇsᴛɪᴏɴ ᴅᴇ sᴜʙ ʙᴏᴛs ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Uso:* ${usedPrefix + command} <acción> [parámetros]\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Acciones disponibles:*\n`
      txt += `╰➺ ✧ ${usedPrefix + command} list\n`
      txt += `╰➺ ✧ ${usedPrefix + command} add <número_bot> <número_owner> <nombre>\n`
      txt += `╰➺ ✧ ${usedPrefix + command} remove <número_bot>\n`
      txt += `╰➺ ✧ ${usedPrefix + command} info <número_bot>\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Ejemplos:*\n`
      txt += `╰➺ ✧ ${usedPrefix + command} list\n`
      txt += `╰➺ ✧ ${usedPrefix + command} add 51901437507 51901437507 Sunkovv\n`
      txt += `╰➺ ✧ ${usedPrefix + command} remove 51901437507\n`
      txt += `╰➺ ✧ ${usedPrefix + command} info 51901437507\n`
      txt += `\n> LOVELLOUD Official`

      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

    const configPath = './sub-bot-owners.json'
    let config = { subBotOwners: {}, description: "Configuración de owners para sub bots." }

    // Cargar configuración existente
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      } catch (error) {
        console.error('Error cargando configuración:', error)
      }
    }

    if (action === 'list') {
      let txt = `╭─「 ✦ 🤖 ʟɪsᴛᴀ ᴅᴇ sᴜʙ ʙᴏᴛs ✦ 」─╮\n`
      txt += `│\n`

      if (Object.keys(config.subBotOwners).length === 0) {
        txt += `╰➺ ✧ *No hay sub bots configurados*\n`
      } else {
        Object.entries(config.subBotOwners).forEach(([botNum, info], index) => {
          txt += `╰➺ ✧ *${index + 1}. Bot:* ${botNum}\n`
          txt += `╰➺ ✧ *Owner:* ${info.owner}\n`
          txt += `╰➺ ✧ *Nombre:* ${info.name}\n`
          txt += `╰➺ ✧ *Tipo:* ${info.type}\n`
          txt += `│\n`
        })
      }

      txt += `\n> LOVELLOUD Official`

      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })

    } else if (action === 'add') {
      if (!botNumber || !ownerNumber || !ownerName) {
        return conn.sendMessage(m.chat, {
          text: '《✧》Faltan parámetros. Uso: .subbot add <número_bot> <número_owner> <nombre>',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const cleanBotNumber = botNumber.replace(/[^0-9]/g, '')
      const cleanOwnerNumber = ownerNumber.replace(/[^0-9]/g, '')
      const ownerJid = cleanOwnerNumber + '@s.whatsapp.net'

      config.subBotOwners[cleanBotNumber] = {
        owner: ownerJid,
        name: ownerName,
        type: cleanBotNumber === '51958333972' ? 'Principal Bot' : 'Sub Bot'
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

      let txt = `╭─「 ✦ ✅ sᴜʙ ʙᴏᴛ ᴀɢʀᴇɢᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Bot:* ${cleanBotNumber}\n`
      txt += `╰➺ ✧ *Owner:* ${ownerJid}\n`
      txt += `╰➺ ✧ *Nombre:* ${ownerName}\n`
      txt += `╰➺ ✧ *Tipo:* ${config.subBotOwners[cleanBotNumber].type}\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
      txt += `\n> LOVELLOUD Official`

      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })

    } else if (action === 'remove') {
      if (!botNumber) {
        return conn.sendMessage(m.chat, {
          text: '《✧》Falta el número del bot. Uso: .subbot remove <número_bot>',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const cleanBotNumber = botNumber.replace(/[^0-9]/g, '')

      if (!config.subBotOwners[cleanBotNumber]) {
        return conn.sendMessage(m.chat, {
          text: '《✧》No se encontró un sub bot con ese número.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const removedBot = config.subBotOwners[cleanBotNumber]
      delete config.subBotOwners[cleanBotNumber]

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

      let txt = `╭─「 ✦ ❌ sᴜʙ ʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴏ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Bot:* ${cleanBotNumber}\n`
      txt += `╰➺ ✧ *Owner:* ${removedBot.owner}\n`
      txt += `╰➺ ✧ *Nombre:* ${removedBot.name}\n`
      txt += `╰➺ ✧ *Tipo:* ${removedBot.type}\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
      txt += `\n> LOVELLOUD Official`

      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })

    } else if (action === 'info') {
      if (!botNumber) {
        return conn.sendMessage(m.chat, {
          text: '《✧》Falta el número del bot. Uso: .subbot info <número_bot>',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const cleanBotNumber = botNumber.replace(/[^0-9]/g, '')

      if (!config.subBotOwners[cleanBotNumber]) {
        return conn.sendMessage(m.chat, {
          text: '《✧》No se encontró un sub bot con ese número.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }

      const botInfo = config.subBotOwners[cleanBotNumber]

      let txt = `╭─「 ✦ ℹ️ ɪɴғᴏ sᴜʙ ʙᴏᴛ ✦ 」─╮\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Bot:* ${cleanBotNumber}\n`
      txt += `╰➺ ✧ *Owner:* ${botInfo.owner}\n`
      txt += `╰➺ ✧ *Nombre:* ${botInfo.name}\n`
      txt += `╰➺ ✧ *Tipo:* ${botInfo.type}\n`
      txt += `│\n`
      txt += `╰➺ ✧ *Usuario:* @${m.sender.split('@')[0]}\n`
      txt += `\n> LOVELLOUD Official`

      return conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo,
          mentionedJid: [m.sender]
        }
      }, { quoted: m })

    } else {
      return conn.sendMessage(m.chat, {
        text: '《✧》Acción no válida. Usa .subbot para ver las opciones disponibles.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, {
      text: '《✧》Ocurrió un error al procesar el comando.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['subbot', 'sub-bot', 'subbotowner', 'subbotowners']
handler.owner = true

export default handler 