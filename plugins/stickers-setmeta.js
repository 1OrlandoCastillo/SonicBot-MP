let handler = async (m, { text }) => {
  if (!text.includes('|') && !text.trim()) {
    return m.reply(`《✧》Por favor, escribe al menos el *pack* o el *autor* que deseas usar por defecto para tus stickers.\n> Ejemplo: *Forger* | Stickers`, m, rcanal)
  }

  let [packname, author] = text.split('|').map(v => v?.trim())
  let user = global.db.data.users[m.sender]

  if (packname) user.packname = packname
  if (author) user.author = author

  if (!packname && !author) {
    return m.reply(`《✧》No se detectó ningún dato válido. Usa el formato:\n> *pack* | autor\n> Ejemplo: *Forger* | Stickers`, m, rcanal)
  }

  m.reply(`✐ Se actualizó el *pack* y/o *autor* por defecto para tus stickers.${
    packname ? `\n> Pack: *${user.packname}*` : ''
  }${author ? `\n> Autor: *${user.author}*` : ''}`, m, rcanal)
}

handler.help = ['setmeta <pack> | <autor>']
handler.tags = ['stickers']
handler.command = /^setmeta$/i

export default handler