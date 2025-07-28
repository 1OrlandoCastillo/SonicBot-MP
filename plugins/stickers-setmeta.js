let handler = async (m, { text }) => {
  if (!text || !text.trim()) {
    return conn.reply(m.chat, `《✧》Por favor, escribe el *pack* y/o el *autor* que deseas usar por defecto para tus stickers.\n> Ejemplo: *Forger* | Stickers`, m, rcanal)
  }

  let packname, author
  let parts = text.split('|').map(v => v.trim())

  if (parts.length === 1) {
    packname = parts[0]
  } else {
    [packname, author] = parts
  }

  if (!packname && !author) {
    return conn.reply(m.chat, `《✧》No se detectó ningún dato válido. Usa el formato:\n> *pack* | autor\n> Ejemplo: *Forger* | Stickers`, m, rcanal)
  }

  let user = global.db.data.users[m.sender]
  if (packname) user.packname = packname
  if (author) user.author = author

  return conn.reply(m.chat, `✐ Se actualizó el *pack* y/o *autor* por defecto para tus stickers.${
    packname ? `\n> Pack: *${user.packname}*` : ''
  }${author ? `\n> Autor: *${user.author}*` : ''}`, m, rcanal)
}

handler.help = ['setmeta <pack> | <autor>']
handler.tags = ['stickers']
handler.command = /^setmeta$/i

export default handler
