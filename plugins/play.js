import yts from 'yt-search'
import { spawn } from 'child_process'
import http from 'http'


function cleanTitle(title) {
  return title
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100);
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return conn.sendMessage(m.chat, {
        text: `《✧》Proporciona un enlace o texto para buscar el video.\n\n📝 *Ejemplos:*\n1️⃣ ${usedPrefix}play https://youtube.com/watch?v=kJQP7kiw5Fk\n2️⃣ ${usedPrefix}play Despacito`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

    let query = args.join(" ").trim()
    let youtubeUrl = query
    let video = null

    
    if (!/^https?:\/\//i.test(youtubeUrl)) {
      const searchResults = await yts(query)
      if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
        return conn.sendMessage(m.chat, {
          text: '《✧》No se encontró ningún video para tu búsqueda.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
      video = searchResults.videos[0]
      
     
      const durationInSeconds = video.duration.seconds || 0
      if (durationInSeconds > 1800) {
        return conn.sendMessage(m.chat, {
          text: '《✧》El video es demasiado largo. El límite es de 30 minutos.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
     
      const estimatedSizeMB = durationInSeconds * 0.1
      if (estimatedSizeMB > 60) {
        return conn.sendMessage(m.chat, {
          text: '《✧》El audio sería demasiado pesado (más de 60MB). Por favor, elige un video más corto.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
      
      youtubeUrl = video.url
      const views = video.views ? video.views.toLocaleString() : "-"
      
     
      await conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩🎵𓆪 ʏᴏᴜᴛᴜʙᴇ ᴍᴘ3 ✦ 」─╮\n│\n╰➺ ✧ *Título:* ${video.title}\n╰➺ ✧ *Duración:* ${video.timestamp}\n╰➺ ✧ *Publicado:* ${video.ago}\n╰➺ ✧ *Canal:* ${video.author.name}\n╰➺ ✧ *Vistas:* ${views}\n╰➺ ✧ *ID:* ${video.videoId}\n╰➺ ✧ *Url:* ${video.url}\n│\n╰➺ ✧ *Generando tu audio, por favor espera un momento...*\n\n> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      
      query = video.title
    }


    if (/^https?:\/\//i.test(youtubeUrl)) {
      youtubeUrl = youtubeUrl
        .replace(/\s+/g, "")
        .replace("https:youtube", "https://youtube")
        .replace("youtubecom", "youtube.com")
        .replace("watch?v=", "/watch?v=")
    }

  
    const port = Math.floor(10000 + Math.random() * 55535)
 
    const safeTitle = cleanTitle(query).replace(/[^a-zA-Z0-9_\-.]/g, "_")
    const ytDlpProcess = spawn("yt-dlp", [
      "-f", "bestaudio",
      "--extract-audio",
      "--audio-format", "mp3",
      "-o", "-",
      youtubeUrl,
    ])

    const server = http.createServer((req, res) => {
  
      let filename = safeTitle && safeTitle.length > 0 ? safeTitle : "audio"
     
      filename = filename.replace(/[\s,;"']/g, "_")
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename=${filename}.mp3`,
      })
      ytDlpProcess.stdout.pipe(res)
      ytDlpProcess.on("close", () => {
        res.end()
        server.close()
      })
    })

    server.listen(port, async () => {
      const audioUrl = `http://localhost:${port}`
      
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          ptt: false,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
        
      } catch (error) {
        await conn.sendMessage(m.chat, {
          text: '《✧》Error al enviar el audio. Por favor, inténtalo de nuevo.',
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
    })

    ytDlpProcess.stderr.on("data", (data) => {
     
      // console.error("STDERR:", data.toString())
    })

    ytDlpProcess.on("error", async (err) => {
      await conn.sendMessage(m.chat, {
        text: '《✧》Ocurrió un problema al generar el audio.',
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      server.close()
    })

  } catch (error) {
    console.error('Error en play:', error)
    await conn.sendMessage(m.chat, {
      text: `《✧》Error: ${error.message}`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#play <enlace o título>']
handler.tags = ['downloader', 'audio']
handler.command = ['play', 'ytmp3', 'mp3']

export default handler 