const free = 50000
const prem = 100000
const cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || { exp: 0 }

  const tiempoEspera = 24 * 60 * 60
  const ahora = Date.now()

  if (cooldowns[m.sender] && ahora - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - ahora) / 1000))
    conn.reply(m.chat, `🚩 Ya has reclamado tu recompensa diaria.\nSolo puedes hacerlo 1 vez cada 24 horas.\n\n*Próximo monto:* +${isPrems ? prem : free} 💫 XP\n*En:* ⏱ ${tiempoRestante}`, m)
    return
  }

  user.exp += isPrems ? prem : free
  conn.reply(m.chat, `🚩 Felicidades 🎉, reclamaste *+${isPrems ? prem : free} 💫 XP*.`, m)

  cooldowns[m.sender] = ahora
}

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']
// handler.register = true // si no quieres forzar registro, comenta esto

export default handler

function segundosAHMS(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segundosRestantes = segundos % 60
  return `${horas} horas, ${minutos} minutos y ${segundosRestantes} segundos`
}