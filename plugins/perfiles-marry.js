let handler = async (m, { conn, mentionedJid }) => {
  const pareja = mentionedJid[0]
  if (!pareja)
    return conn.reply(m.chat, '《✧》Menciona a alguien para casarte. Ej: #marry @usuario', m, rcanal)

  global.db.data.users[m.sender].partner = pareja
  global.db.data.users[pareja].partner = m.sender

  return conn.reply(m.chat, `
✿ Matrimonio realizado

✦ Ahora estás casado con @${pareja.split('@')[0]}
  `.trim(), m, { mentions: [pareja], rcanal })
}

handler.help = ['#marry • #casarse + @usuario\n→ Cásate con otra persona y forma una pareja en tu perfil.']
handler.tags = ['perfiles']
handler.command = /^marry|casarse$/i

export default handler