import fs from 'fs'
import { join } from 'path'

const moneyValues = [1, 3, 5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99, 100, 110, 120, 130, 505, 1000, 1111]
const cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  const tiempoEspera = 2 * 60

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `¿Hola estás bien, corazón?\nYa reclamaste tu recompensa.\n\nEspera:\n\n* ${tiempoRestante} para volver a usar este comando.\n\n* Posibles recompensas: ${moneyValues.map(v => v.toLocaleString()).join(', ')}\n\n> LOVELLOUD Official`, m, rcanal)
    return
  }
  
  let coinName = 'Coins'

  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.coinName) coinName = config.coinName
    } catch (err) {}
  }

  const recompensa = moneyValues[Math.floor(Math.random() * moneyValues.length)]
  user.money = (user.money || 0) + recompensa

  conn.reply(m.chat, `¡Recompensa reclamada con éxito, sigue así!\n\n* ${coinName} (${recompensa.toLocaleString()})\n\n* Cada pequeña acción construye tu camino hacia la grandeza.\n\n> LOVELLOUD Official`, m, rcanal)

  cooldowns[m.sender] = Date.now()
}

handler.help = ['daily']
handler.tags = ['rpg']
handler.command = ['daily', 'claim']

export default handler

function segundosAHMS(segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}
