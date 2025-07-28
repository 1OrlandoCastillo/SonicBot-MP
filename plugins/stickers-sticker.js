let handler = async (m, { conn, quoted }) => {
  let q = quoted || m.quoted

  // Verifica si es una imagen o video
  if (!q || !(q.mimetype || q.type) || !/image|video/.test(q.mimetype || q.type))
    return conn.reply(m.chat, '✦ Cita una imagen o video para convertir en sticker.', m)

  conn.reply(m.chat, '✦ Generando tu sticker...', m)

  try {
    let media = await q.download()
    await conn.sendImageAsSticker(m.chat, media, m, {
      packname: 'Bot Oficial',
      author: '★ StarCor'
    })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '✦ Ocurrió un error al crear el sticker.', m)
  }
}

handler.command = /^s|sticker|stickers$/i
export default handler
