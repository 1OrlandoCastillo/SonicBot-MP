let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat,`𖧏 Hola, debes ingresar el nombre del *Paquete* que deseas Poner.`)
  }
  
  global.db.data.users[m.sender].packname = args.join(' ')
  return conn.reply(m.chat,`𖧏 Hola, el *Packname* se actualizado a *${args.join(' ')}* Correctamente.`)
}

handler.help = ['setpackname']
handler.tags = ['set']
handler.command = ['setpackname']

export default handler
