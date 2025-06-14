let handler = async (m, { args }) => {
  if (!args[0]) {
    return m.reply('✏️ Escribe el nombre que quieres para tu bot en el menú.\n\nEjemplo:\n`.setbotname MiBot`')
  }

  global.db.data.users[m.sender].namebot = args.join(' ')
  m.reply(`✅ Nombre de bot actualizado a: *${args.join(' ')}*`)
}

handler.help = ['setname']
handler.tags = ['set']
handler.command = ['setname']
export default handler
