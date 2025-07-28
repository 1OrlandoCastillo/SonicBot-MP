let handler = async (m, { conn, mentionedJid }) => {
  const pareja = mentionedJid[0]
  if (!pareja) throw '✦ Menciona a alguien para casarte.'
  global.db.data.users[m.sender].partner = pareja
  global.db.data.users[pareja].partner = m.sender
  conn.reply(m.chat, `
✿ Matrimonio realizado

✦ Ahora estás casado con @${pareja.split('@')[0]}

> Sistema de Perfiles - Bot Oficial
  `.trim(), m, { mentions: [pareja] })
}
handler.command = /^marry|casarse$/i
export default handler
