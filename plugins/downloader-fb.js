let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '🚩 Ingresa el enlace del vídeo de Facebook junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://www.facebook.com/official.trash.gang/videos/873759786348039/`, m)
  }

  await m.react('🕓')
  
  try {
    // Cambia 'your_api_key' por tu clave de API válida
    let res = await fetch(`https://api.lolhuman.xyz/api/facebook?apikey=your_api_key&url=${encodeURIComponent(args[0])}`)
    let json = await res.json()
    
    if (json.status !== 200) throw '❌ No se pudo descargar el video.'

    let videoUrl = json.result

    await conn.sendFile(m.chat, videoUrl, 'facebook.mp4', '✅ Video descargado correctamente.', m)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Hubo un error al intentar descargar el video. Asegúrate de que el enlace sea público y válido.', m)
    await m.react('✖️')
  }
}

handler.help = ['fb *<link fb>*']
handler.tags = ['downloader']
handler.command = /^(facebook|fb|facebookdl|fbdl)$/i
export default handler
