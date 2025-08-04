import fetch from "node-fetch"

const BaseYuxinzesite = "http://speedhosting.cloud:2009"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩🎵𓆪 ᴍᴜsɪᴄ ᴘʟᴀʏᴇʀ ✦ 」─╮\n│\n╰➺ ✧ *Uso:* ${usedPrefix}play2 <canción>\n╰➺ ✧ *Ejemplo:* ${usedPrefix}play2 mi camino funk\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }

  
  await conn.sendMessage(m.chat, {
    text: `╭─「 ✦ 𓆩🕒𓆪 ᴘʀᴏᴄᴇsᴀɴᴅᴏ ✦ 」─╮\n│\n╰➺ ✧ *Canción:* ${text}\n╰➺ ✧ *Estado:* Buscando...\n\n> LOVELLOUD Official`,
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })

  try {
   
    const apiyt = await fetchJson(`${BaseYuxinzesite}/pesquisas/ytsearch?query=${encodeURIComponent(text)}`)
    
    if (!apiyt.resultado || apiyt.resultado.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩❌𓆪 ɴᴏ ʀᴇsᴜʟᴛᴀᴅᴏs ✦ 」─╮\n│\n╰➺ ✧ *Búsqueda:* ${text}\n╰➺ ✧ *Estado:* No se encontró la canción\n\n> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

    const ytresult = apiyt.resultado[0]
    const audioUrl = `${BaseYuxinzesite}/download/play-audio?url=${ytresult.url}`

        
     await conn.sendMessage(m.chat, {
       audio: { url: audioUrl },
       mimetype: "audio/mpeg",
       ptt: false,
       contextInfo: {
         externalAdReply: {
           title: `✰ 𝐓𝐢𝐭𝐮𝐥𝐨: ${ytresult.title}`,
           body: `✰ 𝐀𝐮𝐭𝐨𝐫: ${ytresult.author.name} | Duración: ${ytresult.timestamp}`,
           thumbnailUrl: ytresult.image,
           mediaType: 4,
           renderLargerThumbnail: false,
           sourceUrl: ytresult.url
         }
       }
     }, { quoted: m })

  } catch (e) {
    console.error('Error en play2:', e)
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮\n│\n╰➺ ✧ *Error:* ${e.message}\n╰➺ ✧ *Sugerencia:* Inténtalo más tarde\n\n> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['play2', 'music2', 'song2', 'audio2']
handler.tags = ['musica', 'audio', 'entretenimiento']
handler.help = ['play2 <canción> - Reproducir música desde YouTube']

export default handler

async function fetchJson(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error en fetchJson:', error)
    throw error
  }
} 