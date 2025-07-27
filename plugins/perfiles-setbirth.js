let handler = async (m, { conn, args, command, usedPrefix }) => {
  const textoAyuda = `
《 ✧ 》Debes ingresar una fecha válida para tu cumpleaños.

✐ Ejemplo 1 » ${usedPrefix + command} 01/01/2000 (día/mes/año)
✐ Ejemplo 2 » ${usedPrefix + command} 01/01 (día/mes)
✐ Ejemplo 3 » ${usedPrefix + command} 1 january
✐ Ejemplo 4 » ${usedPrefix + command} 24 december
`.trim()

  let fecha = args.join(' ').trim()
  if (!fecha) return conn.reply(m.chat, textoAyuda, m)

  // Validaciones aceptadas: dd/mm/yyyy, dd/mm, "1 january", "24 december"
  const regex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[0-2])([\/\-](\d{4}))?$|^\d{1,2}\s+[a-zA-Z]+$/i
  if (!regex.test(fecha)) return conn.reply(m.chat, textoAyuda, m)

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
`.trim(), m)
}

handler.help = ['setbirth']
handler.tags = ['perfiles']
handler.command = /^setbirth$/i
export default handler
