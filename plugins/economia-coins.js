let handler = async (m, { conn, text, args }) => {
  let who = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : args[0] 
      ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
      : m.sender

  let user = global.db.data.users[who]
  if (!user) return conn.reply(m.chat, `《✧》Usuario no registrado en la base de datos.`, m, rcanal, { mentions: [who] })

  let coins = user.coins || 0

  conn.reply(m.chat, `
✿ Economía de usuario

✐ Usuario: @${who.split('@')[0]}
❏ Coins actuales: ${coins}
  `.trim(), m, rcanal, { mentions: [who] })
}

handler.help = ['balance', 'bal', 'coins']
handler.tags = ['economía']
handler.command = /^balance|bal|coins$/i
export default handler