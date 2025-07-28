import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, quoted }) => {
  let q = quoted || m.quoted

  if (!q || !(q.mimetype || q.type) || !/image|video/.test(q.mimetype || q.type))
    return conn.reply(m.chat, '✦ Cita una imagen o video para convertir en sticker.', m)

  conn.reply(m.chat, '✦ Generando tu sticker...', m)

  try {
    const mime = q.mimetype || ''
    const media = await q.download()

    let isVideo = /video/.test(mime)
    let stiker = await sticker(media, isVideo, 'StarCor Pack', 'Bot Oficial')

    if (!stiker) throw '✦ No se pudo generar el sticker.'

    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '✦ Ocurrió un error al crear el sticker.', m)
  }
}

handler.command = /^s|sticker|stickers$/i
handler.tags = ['sticker']
handler.help = ['sticker (responde a imagen/video)']

export default handler
