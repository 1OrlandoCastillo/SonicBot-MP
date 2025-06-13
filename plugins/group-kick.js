let handler = async (m, { conn, participants }) => {
    // Mensaje por defecto si no hay usuario mencionado
    const kickMsg = `🚩 Menciona al usuario que deseas eliminar o responde a uno de sus mensajes.`

    // Verifica si se ha mencionado a un usuario o se ha citado un mensaje
    if (!m.mentionedJid[0] && !m.quoted) {
        return m.reply(kickMsg, m.chat, { mentions: conn.parseMention(kickMsg) })
    }

    // Obtiene el usuario a eliminar
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender

    // Verifica si el bot está intentando eliminar al dueño del grupo o a sí mismo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const owner = groupMetadata.owner || groupMetadata.participants.find(p => p.admin === 'superadmin')?.id
    if (user === owner) return m.reply('❌ No puedo eliminar al creador del grupo.')
    if (user === conn.user.jid) return m.reply('❌ No puedo eliminarme a mí mismo.')

    // Intenta eliminar al usuario
    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        await m.reply(`✅ Usuario eliminado correctamente.`)
        await conn.sendMessage(user, {
            text: `🚫 Has sido eliminado del grupo *${groupMetadata.subject}*.`,
        })
    } catch (error) {
        console.error(error)
        m.reply('⚠️ Ocurrió un error al intentar eliminar al usuario.')
    }
}

handler.help = ['kick *@user* o respondiendo a un mensaje']
handler.tags = ['group']
handler.command = ['kick', 'expulsar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
