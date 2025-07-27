let handler = async (m, { args }) => {
  let fecha = args[0]
  if (!fecha) throw '✦ Escribe una fecha. Ej: #setbirth 27-07'
  global.db.data.users[m.sender].birth = fecha
  m.reply(`
✿ Configuración actualizada

✦ Tu cumpleaños ha sido registrado como:
❝ ${fecha} ❞
  `.trim())
}
handler.command = /^setbirth$/i
export default handler