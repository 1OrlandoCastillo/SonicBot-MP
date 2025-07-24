import fs from 'fs'
import path from 'path'

let cooldowns = {}

let handler = async (m, { conn }) => {
  const name = conn.getName(m.sender)
  const senderNumber = m.sender.replace(/\D/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  let moneyName = 'Money'

  const configPath = path.join(botPath, 'config.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    if (config.moneyName) moneyName = config.moneyName
  }

  const tiempoEspera = 5 * 60

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    return conn.reply(m.chat, `¿Hola estás bien, corazón?\nYa minastes tu recompensa.\n\nPor favor espera:\n\n* ${tiempoRestante} para volver a usar este comando.\n\n> LOVELLOUD Official`, m, rcanal)
  }

  const reward = Math.floor(Math.random() * 5000) + 100
  global.db.data.users[m.sender].money += reward

  const txt = `¡Genial, corazón!\n\n* Encontraste ${reward.toLocaleString()} ${moneyName} en la mina.\n\n* ¡Sigue explorando, cada paso te acerca a la riqueza!\n\n> LOVELLOUD Offical`
  await conn.reply(m.chat, txt, m, rcanal)

  cooldowns[m.sender] = Date.now()
}

handler.help = ['mine']
handler.tags = ['rpg']
handler.command = ['minar', 'miming', 'mine']

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}