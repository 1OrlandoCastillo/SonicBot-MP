let handler = async (m, { conn }) => {
  let all = Object.entries(global.db.data.users)
    .filter(([_, u]) => u.birth)
    .map(([k, u]) => `• @${k.split('@')[0]} → ${u.birth}`)

  let msg = all.length
    ? `✿ Cumpleaños registrados:\n\n${all.join('\n')}`
    : '✦ No hay cumpleaños registrados.'

  conn.reply(m.chat, msg, m, { mentions: all.map(a => a.replace(/[^\d]/g, '') + '@s.whatsapp.net') })
}
handler.command = /^allbirthdays|allbirths$/i
export default handler