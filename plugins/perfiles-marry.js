let handler = async (m, { conn, mentionedJid }) => {
  let pareja = mentionedJid?.[0] || m.quoted?.sender

  if (!pareja) {
    return conn.reply(m.chat, '《✧》Debes *mencionar* o *responder* a alguien para casarte. Ej: #marry @usuario', m)
  }

  if (pareja === m.sender) {
    return conn.reply(m.chat, '《✧》No puedes casarte contigo mismo.', m)
  }

  if (!global.db.data.users[pareja]) {
    global.db.data.users[pareja] = {}
  }

  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {}
  }

  global.db.data.users[m.sender].partner = pareja
  global.db.data.users[pareja].partner = m.sender

  return conn.reply(m.chat, `
✿ Matrimonio realizado

✦ Ahora estás casado con @${pareja.split('@')[0]}
  `.trim(), m, { mentions: [pareja] })
}

handler.help = ['#marry • #casarse + @usuario\n→ Cásate con otra persona y forma una pareja en tu perfil.']
handler.tags = ['perfiles']
handler.command = /^marry|casarse$/i

export default handler
