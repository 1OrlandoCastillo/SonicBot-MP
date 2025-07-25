let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempoEspera = 5 * 60

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `Hola corazón, ya trabajaste hace poco.\n\n* Por favor espera ${tiempoRestante} para volver a trabajar y seguir ganando.\n\n> LOVELLOUD Official`, m, rcanal)
    return
  }
  
  let moneyName = 'Money'

  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = join('./Serbot', botActual, 'config.json')

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.coinName) moneyName = config.moneyName
    } catch (err) {}
  }
  
  let resultado = Math.floor(Math.random() * 5000)
  cooldowns[m.sender] = Date.now()
  user.money = (user.money || 0) + resultado

  await conn.reply(m.chat, `${pickRandom(works)}\n\n* Has ganado ${toNum(resultado)} ${moneyName} ( ${resultado.toLocaleString()} )\n\n* ¡Sigue trabajando, corazón… el éxito está más cerca de lo que imaginas!\n\n> LOVELLOUD Official`, m, rcanal)
}

handler.help = ['work']
handler.tags = ['rpg']
handler.command = ['w', 'work', 'trabajar']
export default handler

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else if (number <= -1000 && number > -1000000) {
    return (number / 1000).toFixed(1) + 'k'
  } else if (number <= -1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else {
    return number.toString()
  }
}

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const works = [
  "Trabajaste como cortador de galletas y recibiste",
  "Prestaste servicio militar privado y ganaste",
  "Organizaste una cata de vinos y obtuviste",
  "Limpiaste chimeneas viejas y encontraste",
  "Desarrollaste un videojuego indie y ganaste",
  "Hiciste horas extra en la oficina y recibiste",
  "Fuiste secuestrador de novias (consensuado) y ganaste",
  "Disfrutaste una obra callejera y te pagaron",
  "Vendiste antigüedades raras y ganaste",
  "Cocinaste en el restaurante de la abuela y ganaste",
  "Hiciste pizzas a domicilio y te pagaron",
  "Escribiste galletas de la fortuna y ganaste",
  "Vendiste basura valiosa y recibiste",
  "Diseñaste un logo para una startup y ganaste",
  "Fuiste artista callejero y recibiste",
  "Arreglaste una recreativa clásica y ganaste",
  "Cultivaste hierbas mágicas y vendiste por",
  "Trabajaste como panda en Disneyland y ganaste",
  "Vendiste sándwiches de pescado y obtuviste",
  "Resolviste un caso de cólera y te recompensaron con",
  "Actuaste como la voz de Bob Esponja y te pagaron",
]