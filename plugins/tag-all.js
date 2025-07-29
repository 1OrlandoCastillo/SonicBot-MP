let handler = async (m, { conn, text, isAdmin, isOwner, isPrems }) => {

  if (!m.isGroup) return m.reply('*[❗] Este comando solo puede ser usado en grupos.*')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('*[❗] Solo los administradores pueden usar este comando.*')
  
  try {

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    
    await conn.sendMessage(m.chat, { 
      text: text || ' ',
      mentions: participants.map(p => p.id)
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en comando tag-all:', e)
    m.reply('*[❗] Ocurrió un error al intentar etiquetar a los miembros del grupo.*')
  }
}

handler.help = ['#tag']
handler.tags = ['grupos']
handler.command = /^(tag|todos|mencionartodos)$/i
handler.group = true
handler.admin = true

export default handler
