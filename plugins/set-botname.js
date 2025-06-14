let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat,`𖧏 Hola, necesito que me proporciones el nombre del *Bot* que deseas Poner.`, m, rcanal)
  }
  
  global.db.data.users[m.sender].namebot = args.join(' ')
  return conn.reply(m.chat,`𖧏 Hola, el *Nombre* que proporcionastes se cambio a *${args.join(' ')}* Correctamente.`, m, rcanal)
}

handler.help = ['setname']
handler.tags = ['set']
handler.command = ['setname']

export default handler
