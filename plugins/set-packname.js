let handler = async (m, { args, usedPrefix, command }) => {
  if (!global.db.data.subbots?.[m.sender]) 
    return m.reply('🚫 Este comando es solo para sub-bots conectados.')

  if (!args[0]) 
    return m.reply(`✦ Escribe el nombre del paquete.\nEj: ${usedPrefix + command} Mis Stickers`)

  global.db.data.users[m.sender].packname = args.join(' ')
  m.reply(`✅ Packname actualizado a:\n*${args.join(' ')}*`)
}

handler.help = ['setpackname <texto>']
handler.tags = ['set']
handler.command = ['setpackname']

export default handler
