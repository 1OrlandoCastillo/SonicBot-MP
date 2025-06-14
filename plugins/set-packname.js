let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✦ Ingresa el nombre del paquete.\n\n*Ejemplo:* \n${usedPrefix + command} Mis Stickers`)
  }
  
  global.db.data.users[m.sender].packname = args.join(' ')
  m.reply(`✅ Packname actualizado a:\n*${args.join(' ')}*`)
}

handler.help = ['setpackname']
handler.tags = ['set']
handler.command = ['setpackname']

export default handler
