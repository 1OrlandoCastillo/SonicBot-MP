let handler = async (m, { text }) => {
  if (!text)
    return conn.reply(m.chat, '《✧》Escribe tu personaje favorito. Ej: #setfav Luffy', m, rcanal)

  global.db.data.users[m.sender].favourite = text

  return conn.reply(m.chat, `✐ Tu favorito ha sido guardado como *${text}*!`, m, rcanal)
}

handler.help = ['#setfav • #setfavourite + [Personaje]\n→ Establece tu personaje o ídolo favorito en tu perfil.']
handler.tags = ['perfiles']
handler.command = ['setfav', 'setfavourite']

export default handler