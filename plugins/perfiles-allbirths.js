import moment from 'moment-timezone'

let handler = async (m, { conn }) => {
  let users = Object.entries(global.db.data.users)
    .filter(([_, u]) => u.birth)

  if (!users.length) return conn.reply(m.chat, '✦ No hay cumpleaños registrados.', m, rcanal)

  let now = moment.tz('America/Lima')
  let lista = []

  for (let [jid, data] of users) {
    let fecha = data.birth
    let [d, m, y] = fecha.split(/[\/\-]/).map(n => parseInt(n))
    if (!y) y = now.year()
    let cumple = moment.tz(`${d}/${m}/${y}`, 'D/M/YYYY', 'America/Lima')
    if (cumple.isBefore(now)) cumple.year(now.year() + 1)

    let diff = moment.duration(cumple.diff(now))
    let dias = Math.floor(diff.asDays())
    let horas = diff.hours()
    let minutos = diff.minutes()
    let segundos = diff.seconds()

    let diaSemana = cumple.format('dddd') // lunes, martes, etc.
    let fechaTexto = `${diaSemana}, ${d} de ${cumple.format('MMMM')}`

    lista.push(`✒ @${jid.split('@')[0]} » *${fechaTexto}*\n→ ${dias} días ${horas} horas ${minutos} minutos ${segundos} segundos`)
  }

  let texto = `「✿」Cumpleaños en *${await conn.getName(m.chat)}*:\n\n` + lista.sort((a, b) => {
    let t1 = parseInt(a.match(/→ (\d+) días/)[1])
    let t2 = parseInt(b.match(/→ (\d+) días/)[1])
    return t1 - t2
  }).join('\n\n')

  conn.reply(m.chat, texto, m, rcanal, { mentions: users.map(([k]) => k) })
}

handler.help = ['#allbirthdays • #allbirths\n→ Consulta el calendario de cumpleaños de los usuarios']
handler.tags = ['perfiles']
handler.command = /^allbirthdays|allbirths$/i
export default handler
