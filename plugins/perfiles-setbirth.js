let handler = async (m, { conn }) => {
  const textoAyuda = `
《 ✧ 》Debes ingresar una fecha válida para tu cumpleaños.

📎 Ejemplo 1 » #setbirth 01/01/2000 (mes/día/año)
📎 Ejemplo 2 » #setbirth 01/01 (mes/día)
📎 Ejemplo 3 » #setbirth 1 january
📎 Ejemplo 4 » #setbirth 24 december
`, m)

  let fecha = args[0]
  if (!fecha) throw textoAyuda

  let regex = /^(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])([\/\-](\d{4}))?$/i
  if (!regex.test(fecha)) throw textoAyuda

  let user = global.db.data.users[m.sender] || {}

  if (user.birth) {
    return conn.reply(m.chat, `「✐」Se ha establecido tu cumpleaños, si quieres borrar la fecha usa: *#delbirth*`, m, rcanal)
}

handler.command = /^setbirth$/i
export default handler
