let handler = async (m, { conn, text, args }) => {
  let who = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : args[0] 
      ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
      : m.sender

  let user = global.db.data.users[who]
  if (!user) throw `✦ Usuario no registrado en la base de datos.`

  let coins = user.coins || 0

  conn.reply(m.chat, `
✿ Balance de usuario

✦ Usuario: @${who.split('@')[0]}
✦ Coins actuales: ${coins} 🪙

> Sistema de Economía - Bot Oficial
  `.trim(), m, { mentions: [who] })
}

handler.command = /^balance|bal|coins$/i
export default handler