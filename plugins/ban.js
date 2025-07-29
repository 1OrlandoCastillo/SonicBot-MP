import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('*[❗] Este comando solo puede ser usado en grupos.*')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('*[❗] Solo los administradores pueden usar este comando.*')
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply(`*[❗] Debes mencionar al usuario que deseas banear.*\n*Ejemplo:* ${usedPrefix + command} @usuario`)
  }
  const who = m.mentionedJid[0]
  
  const ownerNumbers = global.owner.map(v => {
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '');
    return id + '@s.whatsapp.net';
  });
  
  if (ownerNumbers.includes(who)) {
    return m.reply('*[❗] No puedes banear a un propietario del bot.*');
  }
  
  if (who === conn.user.jid) return m.reply('*[❗] No puedes banear al bot.*')
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    
    if (!global.db.data.users[who]) {
      global.db.data.users[who] = {}
    }
    global.db.data.users[who].banned = true
    
    m.reply(`*[✅] Usuario baneado exitosamente.*\n\n*Usuario:* @${who.split('@')[0]}\n*Grupo:* ${(await conn.groupMetadata(m.chat)).subject}\n*Admin:* @${m.sender.split('@')[0]}`, null, { mentions: [who, m.sender] })
    
  } catch (e) {
    console.error('Error al banear usuario:', e)
    m.reply('*[❗] Ocurrió un error al intentar banear al usuario. Por favor, inténtalo de nuevo.*')
  }
}

handler.help = ['#ban @usuario']
handler.tags = ['grupos']
handler.command = /^ban(ear)?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
