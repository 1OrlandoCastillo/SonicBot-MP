const moneyValues = [1, 50, 100, 500, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 50000, 75000, 100000]
const cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  const tiempoEspera = 2 * 60

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🚩 Ya reclamaste tu recompensa.\nEspera ⏱ *${tiempoRestante}* para volver a usar este comando.\n\n💰 *Posibles recompensas*: ${moneyValues.map(v => v.toLocaleString()).join(', ')}`, m, rcanal)
    return
  }

  const recompensa = moneyValues[Math.floor(Math.random() * moneyValues.length)]
  user.money = (user.money || 0) + recompensa

  conn.reply(m.chat, `🎁 Recompensa reclamada:\nRecibiste *${recompensa.toLocaleString()} 💰 coins*.`, m, rcanal)

  cooldowns[m.sender] = Date.now()
}

handler.help = ['claim']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']

export default handler

function segundosAHMS(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}
