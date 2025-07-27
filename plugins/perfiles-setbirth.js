let handler = async (m, { conn, args, rcanal }) => {
  const textoAyuda = `
《 ✧ 》Debes ingresar una fecha válida para tu cumpleaños.

📎 Ejemplo 1 » #setbirth 01/01/2000 (mes/día/año)
📎 Ejemplo 2 » #setbirth 01/01 (mes/día)
📎 Ejemplo 3 » #setbirth 1 january
📎 Ejemplo 4 » #setbirth 24 december
`.trim()

  let fecha = args.join(' ').trim()
  if (!fecha) return conn.reply(m.chat, textoAyuda, m, rcanal)

  // Validación de fecha (dd/mm, dd/mm/yyyy o formato "1 january")
  const regex = /^(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])([\/\-](\d{4}))?$|^\d{1,2}\s+[a-zA-Z]+$/i
  if (!regex.test(fecha)) return conn.reply(m.chat, textoAyuda, m, rcanal)

  let user = global.db.data.users[m.sender]
  if (!user) global.db.data.users[m.sender] = {}

  if (user.birth) {
    return conn.reply(m.chat, `「✐」Ya has establecido tu cumpleaños. Si deseas borrarlo, usa: *#delbirth*`, m, rcanal)
  }

  global.db.data.users[m.sender].birth = fecha

  return conn.reply(m.chat, `
✿ Configuración actualizada

✦ Tu cumpleaños ha sido registrado como:
❝ ${fecha} ❞
`.trim(), m, rcanal)
}

handler.command = /^setbirth$/i
export default handler
