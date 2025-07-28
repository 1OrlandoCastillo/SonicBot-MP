let handler = async (m) => {
  let user = global.db.data.users[m.sender]

  user.packname = ''
  user.author = ''

  m.reply(`✐ Se restablecieron el *pack* y *autor* por defecto para tus stickers.`, rcanal)
}

handler.help = ['delstickermeta', 'delmeta']
handler.tags = ['stickers']
handler.command = /^delstickermeta|delmeta$/i

export default handler