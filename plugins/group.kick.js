let handler = async (m, { conn, args, participants }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender)
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner

  if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.')

  let user
  if (m.mentionedJid?.[0]) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else if (args[0]) {
    const number = args[0].replace(/[^0-9]/g, '')
    if (!number) return m.reply('⚠️ Número inválido.')
    user = number + '@s.whatsapp.net'
  } else {
    const txt = `🚩 Menciona, responde o escribe el número del usuario que deseas eliminar.`
    return m.reply(txt, m.chat, { mentions: conn.parseMention(txt) })
  }

  const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot = global.owner?.[0]?.[0] + '@s.whatsapp.net'

  if (user === conn.user.jid) return m.reply(`😹 No me puedo sacar a mí mismo`)
  if (user === ownerGroup) return m.reply(`👑 Ese es el dueño del grupo`)
  if (user === ownerBot) return m.reply(`💥 Ese es el dueño del bot`)

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    await m.reply(`✅ Usuario eliminado del grupo.`)
    await m.reply(`Has sido eliminado del grupo.`, user)
  } catch (e) {
    await m.reply(`❌ No pude expulsar al usuario. Verifica si tengo permisos de admin.`)
  }
}

handler.help = ['kick *@usuario*', 'kick 519xxxxxxxx']
handler.tags = ['group']
handler.command = ['kick', 'expulsar', 'echar', 'ban', 'sacar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
