let handler = async (m, rcanal) => {
    let { conn, participants } = rcanal

    let kickMsg = `🚩 Menciona al usuario que deseas eliminar.`

    if (!m.mentionedJid?.[0] && !m.quoted)
        return m.reply(kickMsg, m.chat, { mentions: conn.parseMention(kickMsg) })

    let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender

    // Verifica si el usuario es parte del grupo
    let isParticipant = participants.some(p => p.id === user)
    if (!isParticipant) return m.reply('❌ El usuario no está en el grupo.')

    // Intenta eliminar al usuario
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    // Confirmaciones
    m.reply(`🚩 Usuario eliminado del grupo.`)
    m.reply(`Has sido eliminado del grupo.`, user)
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'expulsar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler