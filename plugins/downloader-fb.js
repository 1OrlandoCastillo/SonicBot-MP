import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `🚩 Ingresa el enlace del vídeo de Facebook junto al comando.\n\n` +
            `*Ejemplo:* ${usedPrefix + command} https://www.facebook.com/watch/?v=123456789`, m)
    }

    await m.react('🕓')

    try {
        let url = args[0]
        let res = await fetch(`https://saveas.co/api/ajaxSearch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `q=${encodeURIComponent(url)}`
        })

        let json = await res.json()
        if (json && json.links && json.links.length > 0) {
            let videoUrl = json.links[0].url
            await conn.sendFile(m.chat, videoUrl, 'fbvideo.mp4', '✅ Video descargado con éxito.', m)
            await m.react('✅')
        } else {
            await m.react('✖️')
        } // <- ESTA llave estaba faltando
    } catch (err) {
        console.error(err)
        await m.reply('❌ Ocurrió un error al intentar descargar el video.')
        await m.react('⚠️')
    }
}

handler.help = ['facebook *<link fb>*']
handler.tags = ['downloader']
handler.command = /^(facebook|fb|fbdl)$/i
export default handler
