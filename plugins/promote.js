let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('*[❗] Este comando solo puede ser usado en grupos.*')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('*[❗] Solo los administradores pueden usar este comando.*')
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply(`*[❗] Debes mencionar al usuario que deseas promover.*\n*Ejemplo:* ${usedPrefix + command} @usuario`)
  }
  const who = m.mentionedJid[0]
  
  if (who === conn.user.jid) return m.reply('*[❗] No puedes promover al bot.*')
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const isUserAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
  if (isUserAdmin) {
    return m.reply(`*[❗] El usuario @${who.split('@')[0]} ya es administrador del grupo.*`, 
      null, { mentions: [who] })
  }
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    m.reply(
      `*[✅] Usuario promovido a administrador exitosamente.*\n\n` +
      `*Usuario:* @${who.split('@')[0]}\n` +
      `*Grupo:* ${(await conn.groupMetadata(m.chat)).subject}\n` +
      `*Admin:* @${m.sender.split('@')[0]}`,
      null,
      { mentions: [who, m.sender] }
    )
    
  } catch (e) {
    console.error('Error al promover usuario:', e)
    m.reply('*[❗] Ocurrió un error al intentar promover al usuario. Por favor, inténtalo de nuevo.*')
  }
}

handler.help = ['#promote @usuario']
handler.tags = ['grupos']
handler.command = /^(promote|promover|daradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
