let handler = async (m, { conn, participants }) => {

let promote = `✿ Menciona al usuario que deseas promover a administrador.`

if (!m.mentionedJid[0] && !m.quoted) return m.reply(promote, m.chat, { mentions: conn.parseMention(promote) })
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
m.reply(`✿ Usuario promovido a administrador.`)
}

handler.help = ['promote *<@user>*']
handler.tags = ['group']
handler.command = ['promote', 'promover'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler