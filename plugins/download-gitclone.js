import fetch from 'node-fetch'

let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*[❗] Escribe la URL de un repositorio de GitHub que deseas descargar.*\n\n> Ejemplo: ${usedPrefix + command} https://github.com/usuario/repositorio`)
  }
  
  if (!regex.test(args[0])) {
    return m.reply(`*[❗] Verifica que la URL sea de GitHub.*\n\n> Ejemplo: ${usedPrefix + command} https://github.com/usuario/repositorio`)
  }
  
  try {
    let [_, user, repo] = args[0].match(regex) || []
    let sanitizedRepo = repo.replace(/.git$/, '')
    let repoUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}`
    let zipUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}/zipball`
    
    
    let [repoResponse, zipResponse] = await Promise.all([
      fetch(repoUrl),
      fetch(zipUrl),
    ])
    
    if (!repoResponse.ok) {
      return m.reply(`*[❌] Error: No se pudo acceder al repositorio.*\n\n> Verifica que el repositorio exista y sea público.`)
    }
    
    if (!zipResponse.ok) {
      return m.reply(`*[❌] Error: No se pudo descargar el archivo ZIP.*\n\n> El repositorio podría ser privado o muy grande.`)
    }
    
    let repoData = await repoResponse.json()
    let contentDisposition = zipResponse.headers.get('content-disposition')
    let filename = 'repository.zip'
    
    if (contentDisposition) {
      const match = contentDisposition.match(/attachment; filename=(.*)/)
      if (match) {
        filename = match[1]
      }
    }
    
    let txt = `╭─「 ✦ 𓆩📦𓆪 ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅ ✦ 」─╮

╰➺ ✧ *Nombre:* ${filename}
╰➺ ✧ *Repositorio:* ${user}/${sanitizedRepo}
╰➺ ✧ *Creador:* ${repoData.owner.login}
╰➺ ✧ *Descripción:* ${repoData.description || 'Sin descripción disponible'}
╰➺ ✧ *URL:* ${args[0]}

> LOVELLOUD Official`

   
    const imgResponse = await fetch('https://files.catbox.moe/t8ampx.jpg')
    const imgBuffer = await imgResponse.buffer()
    
    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: txt,
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
    
    const zipBuffer = await zipResponse.buffer()
    await conn.sendMessage(m.chat, {
      document: zipBuffer,
      fileName: filename,
      mimetype: 'application/zip',
      contextInfo: {
        ...rcanal.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    
  } catch (error) {
    console.error('Error en gitclone:', error)
    m.reply(`*[❌] Ocurrió un error al procesar el repositorio.*\n\n> Error: ${error.message}`)
  }
}
handler.command = /^(git)$/i
export default handler