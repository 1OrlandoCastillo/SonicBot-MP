import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, quoted }) => {
  let q = quoted || m.quoted

  if (!q || !(q.mimetype || q.type) || !/image|video/.test(q.mimetype || q.type))
    return conn.reply(m.chat, '✦ Cita una imagen o video para convertir en sticker.', m)

  conn.reply(m.chat, '✦ Generando tu sticker...', m)

  try {
    const mime = q.mimetype || ''
    const media = await q.download()

    let stiker = false
    if (/image/.test(mime)) {
      stiker = await sticker(media, false, 'Bot Oficial', '★ StarCor')
    } else if (/video/.test(mime)) {
      stiker = await sticker(media, true, 'Bot Oficial', '★ StarCor') // para video sticker
    }

    if (stiker) await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
    else throw '✦ No se pudo generar el sticker.'
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '✦ Ocurrió un error al crear el sticker.', m)
  }
}

handler.command = /^s|sticker|stickers$/i
export default handler
