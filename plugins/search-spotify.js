import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `✿ Ingresa el nombre de la canción o artista que deseas buscar en *Spotify.*`, m)

  await m.react('🕓')
  let img = `./storage/img/menu.jpg`

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/search/spotify?q=${encodeURIComponent(text)}`)

    const results = data?.result || []

    if (results.length > 0) {
      let txt = `*✿ Resultados de búsqueda en Spotify:*\n`

      for (let i = 0; i < (results.length >= 10 ? 10 : results.length); i++) {
        const track = results[i]
        txt += `\n`
        txt += `*• Nro →* ${i + 1}\n`
        txt += `*• Título →* ${track.title || 'Sin título'}\n`
        txt += `*• Artista →* ${track.artist || 'Desconocido'}\n`
        txt += `*• Álbum →* ${track.album || 'Desconocido'}\n`
        txt += `*• Duración →* ${track.duration || 'Desconocida'}\n`
        txt += `*• Url →* ${track.url || 'Sin enlace'}\n`
      }

      await conn.sendFile(m.chat, img, 'spotify-search.jpg', txt, m)
      await m.react('✅')
    } else {
      await conn.reply(m.chat, '✖️ No se encontraron resultados en Spotify.', m)
      await m.react('❌')
    }
  } catch (err) {
    console.error(err)
    await m.reply('❌ Hubo un error al realizar la búsqueda.', m)
    await m.react('❌')
  }
}

handler.tags = ['search']
handler.help = ['spotifysearch *<búsqueda>*']
handler.command = ['spotifysearch', 'spotify']

export default handler