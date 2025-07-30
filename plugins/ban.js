import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('《✧》Este comando solo puede ser usado en grupos.')
  
  if (!isAdmin && !isOwner && !isPrems) return m.reply('《✧》Solo los administradores pueden usar este comando.')
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return m.reply(`《✧》Debes mencionar al usuario que deseas banear.\n\n> Ejemplo: ${usedPrefix + command} @usuario`)
  }
  const who = m.mentionedJid[0]
  
  const ownerNumbers = global.owner.map(v => {
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '');
    return id + '@s.whatsapp.net';
  });
  
  if (ownerNumbers.includes(who)) {
    return m.reply('《✧》No puedes banear a un propietario del bot.')
  }
  
  if (who === conn.user.jid) return m.reply('《✧》No se puede usar este comando para banear al bot.')
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {}
  }
  global.db.data.users[who].banned = true
  

  const userName = await conn.getName(who)
  const adminName = await conn.getName(m.sender)
  const groupName = (await conn.groupMetadata(m.chat)).subject
  

  return conn.sendMessage(m.chat, {
    text: `[✅] Usuario baneado exitosamente.\n\nUsuario: @${who.split('@')[0]}\nGrupo: ${groupName}\nAdmin: @${m.sender.split('@')[0]}`,
    contextInfo: {
      ...rcanal.contextInfo,
      mentionedJid: [who, m.sender]
    }
  }, { quoted: m })
}

handler.command = /^banear|ban|kick?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
