import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('*[❗] Solo los dueños pueden usar este comando.*')
  }

  
  if (!args[0]) {
    try {
      const pluginsDir = './plugins'
      const files = fs.readdirSync(pluginsDir)
      const jsFiles = files.filter(file => file.endsWith('.js'))
      
      if (jsFiles.length === 0) {
        return m.reply('*[❗] No se encontraron plugins en el directorio.*')
      }

      let txt = `╭─「 ✦ 𓆩📁𓆪 ᴘʟᴜɢɪɴs ᴅɪsᴘᴏɴɪʙʟᴇs ✦ 」─╮\n`
      txt += `│\n`
      
      jsFiles.forEach((file, index) => {
        const filePath = join(pluginsDir, file)
        const stats = fs.statSync(filePath)
        const size = (stats.size / 1024).toFixed(2) 
        
        txt += `╰➺ ✧ *${index + 1}.* ${file}\n`
        txt += `│   • Tamaño: ${size} KB\n`
        if (index < jsFiles.length - 1) txt += `│\n`
      })
      
      txt += `│\n`
      txt += `╰➺ ✧ *Total:* ${jsFiles.length} plugins\n`
      txt += `╰➺ ✧ *Para reemplazar:* ${usedPrefix}replugin <nombre.js>\n`
      txt += `│\n`
      txt += `╰────────────────╯\n`
      txt += `\n> LOVELLOUD Official`

      await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })

    } catch (error) {
      console.error('Error listando plugins:', error)
      m.reply('*[❗] Error al listar los plugins.*')
    }
    return
  }

  
  let fileName = args[0]
  
 
  if (!fileName.endsWith('.js')) {
    fileName += '.js'
  }

  
  if (!/^[a-zA-Z0-9-_]+\.js$/.test(fileName)) {
    return m.reply('*[❗] Nombre de archivo inválido. Solo letras, números, guiones y guiones bajos.*')
  }

  const pluginPath = join('./plugins', fileName)

 
  if (!fs.existsSync(pluginPath)) {
    return m.reply(`*[❗] El archivo ${fileName} no existe.*\n\nUsa ${usedPrefix}replugin para ver todos los plugins disponibles.`)
  }

  
  if (!m.quoted || !m.quoted.text) {
    return m.reply(`*[❗] Debes responder a un mensaje con el nuevo código del plugin.*

*Ejemplo:*
1. Escribe: ${usedPrefix}replugin ${fileName}
2. Responde a este mensaje con el código completo del nuevo plugin`)
  }

  let newPluginContent = m.quoted.text

  try {
    
    const backupPath = pluginPath + '.backup'
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(pluginPath, backupPath)
    }

    
    fs.writeFileSync(pluginPath, newPluginContent, 'utf8')
    
    let txt = `╭─「 ✦ 𓆩🔄𓆪 ᴘʟᴜɢɪɴ ʀᴇᴇᴍᴘʟᴀᴢᴀᴅᴏ ✦ 」─╮\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Archivo:* ${fileName}\n`
    txt += `╰➺ ✧ *Ruta:* plugins/${fileName}\n`
    txt += `╰➺ ✧ *Estado:* Reemplazado exitosamente ✅\n`
    txt += `╰➺ ✧ *Backup:* ${fileName}.backup\n`
    txt += `│\n`
    txt += `╰➺ ✧ *Comando:* .${fileName.replace('.js', '')}\n`
    txt += `╰➺ ✧ *Recarga:* El plugin se cargará automáticamente\n`
    txt += `│\n`
    txt += `╰────────────────╯\n`
    txt += `\n> LOVELLOUD Official`

    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })

  } catch (error) {
    console.error('Error reemplazando plugin:', error)
    m.reply(`*[❗] Error al reemplazar el plugin: ${error.message}*`)
  }
}

handler.help = ['#replugin\n→ Listar todos los plugins', '#replugin <nombre.js>\n→ Reemplazar un plugin (responde con el código)']
handler.tags = ['owner']
handler.command = ['replugin', 'replaceplugin', 'reemplazarplugin']

export default handler 