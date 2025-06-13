let handler = async (m, { conn, participants }) => {

let kickMsg = `🚩 Menciona al usuario que deseas eliminar.`

if (!m.mentionedJid[0] && !m.quoted) 
    return m.reply(m.chat, kickMsg, m, rcanal, { mentions: conn.parseMention(kickMsg) })

let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
m.reply(`🚩 Usuario eliminado del grupo.`)
m.reply(`Has sido eliminado del grupo.`, user)

}

handler.help = ['kick *@user*']
handler.tags = ['group']
handler.command = ['kick', 'expulsar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
