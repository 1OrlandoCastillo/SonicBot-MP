let handler = async (m, { conn, quoted }) => {
  if (!quoted || !/image|video/.test(quoted.mimetype))
    return conn.reply(m.chat, '✦ Cita una imagen o video para convertir a sticker.', m)

  conn.reply(m.chat, '✦ Generando tu sticker...', m)

  try {
    let media = await quoted.download()
    let sticker = await conn.sendImageAsSticker(m.chat, media, m, {
      packname: 'Bot Oficial',
      author: '★ StarCor'
    })
  } catch (e) {
    conn.reply(m.chat, '✦ Ocurrió un error al crear el sticker.', m)
    console.error(e)
  }
}

handler.command = /^sticker|s|stickers$/i
export default handler
