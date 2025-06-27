let handler = async (m, { conn, args, participants }) => {
  if (!m.isGroup) return
  if (!participants.some(p => p.id === m.sender && p.admin)) return
  if (!participants.some(p => p.id === conn.user.jid && p.admin)) return

  let users = m.mentionedJid.length
    ? m.mentionedJid
    : args[0]
    ? [args[0].replace(/\D/g, '') + '@s.whatsapp.net']
    : []

  if (!users.length) return m.reply('📌 Menciona al usuario que deseas eliminar.')

  for (let user of users) {
    if (user !== m.sender && user !== conn.user.jid) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    }
  }
}

handler.command = /^kick$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler