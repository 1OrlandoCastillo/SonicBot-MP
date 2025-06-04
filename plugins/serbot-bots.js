import ws from 'ws'

// Convierte milisegundos a formato legible: "1h 23m 45s"
function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000)
  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = totalSeconds % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

// Convierte timestamp a fecha y hora legible
function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    timeZone: 'America/Mexico_City', // Puedes ajustar tu zona horaria aquí
    hour12: true
  })
}

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

  global.conns.forEach((conn) => {
    if (conn.user && conn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(conn.user.jid, conn)
    }
  })

  let totalUsers = uniqueUsers.size
  let txt = `✿ Total Bots → *${totalUsers || 0}*\n\n`

  const now = Date.now()
  let count = 1

  for (let [jid, conn] of uniqueUsers.entries()) {
    let name = conn.user.name || conn.user.pushname || 'Desconocido'
    let connectedAt = conn.connectedAt || null

    let uptime = connectedAt ? formatDuration(now - connectedAt) : 'Desconocido'
    let connectedDate = connectedAt ? formatDateTime(connectedAt) : 'Desconocido'

    txt += `${count}. ${name} (${jid})\n`
    txt += `   ⌛ Tiempo conectado: ${uptime}\n`
    txt += `   📅 Conectado desde: ${connectedDate}\n\n`

    count++
  }

  await conn.reply(m.chat, txt.trim(), m)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler
