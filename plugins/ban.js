import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, '《✧》Este comando solo puede ser usado en grupos.', m, rcanal)
  
  if (!isAdmin && !isOwner && !isPrems) return conn.reply(m.chat, '《✧》Solo los administradores pueden usar este comando.', m, rcanal)
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return conn.reply(m.chat, `《✧》Debes mencionar al usuario que deseas banear.\n\n> Ejemplo: ${usedPrefix + command} @usuario`, m, rcanal)
  }
  const who = m.mentionedJid[0]
  
  const ownerNumbers = global.owner.map(v => {
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '');
    return id + '@s.whatsapp.net';
  });
  
  if (ownerNumbers.includes(who)) {
    return conn.reply(m.chat, '《✧》No puedes banear a un propietario del bot.', m, rcanal)
  }
  
  if (who === conn.user.jid) return conn.reply(m.chat, '《✧》No se puede usar este comando para banear al bot.', m, rcanal)
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {}
  }
  global.db.data.users[who].banned = true
  
  return conn.reply(m.chat, `❏ Usuario baneado exitosamente.\n\n✐ Usuario: @${who.split('@')[0]}\n✐ Grupo: ${(await conn.groupMetadata(m.chat)).subject}\n✐ Admin: @${m.sender.split('@')[0]}`, m, rcanal, { mentions: [who, m.sender] })
}

handler.command = /^banear|kick?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
