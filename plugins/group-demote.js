let handler = async (m, { conn, participants }) => {

let demote = `✿ Menciona al administrador que deseas degradar a miembro.`

if (!m.mentionedJid[0] && !m.quoted) return m.reply(demote, m.chat, { mentions: conn.parseMention(demote) })
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
m.reply(`✿ Usuario degradado a miembro.`)
}

handler.help = ['demote *<@user>*']
handler.tags = ['group']
handler.command = ['demote', 'degradar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler