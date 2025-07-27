let handler = async (m, { conn }) => {
  let hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
  let cumple = Object.entries(global.db.data.users)
    .filter(([_, u]) => u.birth === hoy)
    .map(([k]) => `🎉 @${k.split('@')[0]}`)

  let msg = cumple.length
    ? `✿ Cumpleaños del día:\n\n${cumple.join('\n')}`
    : '✦ Hoy no hay cumpleaños.'

  conn.reply(m.chat, msg, m, rcanal, { mentions: cumple.map(v => v.replace(/[^\d]/g, '') + '@s.whatsapp.net') })
}
handler.help = ['#birthdays • #cumpleaños • #births\n→ Revisa quién está por celebrar su día']
handler.tags = ['perfiles']
handler.command = /^birthdays|cumpleaños|births$/i
export default handler