let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat,`𖧏 Hola, necesito que me proporciones el nombre que del *Author* que deseas Poner.`, m, rcanal)
  }
  
  global.db.data.users[m.sender].author = args.join(' ')
  return conn.reply(m.chat,`𖧏 Hola, el *Author* que proporcionastes se cambio a *${args.join(' ')}* Correctamente.`, m, rcanal)
}

handler.help = ['setauthor']
handler.tags = ['set']
handler.command = ['setauthor']

export default handler