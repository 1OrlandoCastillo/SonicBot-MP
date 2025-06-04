import ws from 'ws'

let handler = async (m, { conn, usedPrefix, command }) => {
  // Inicializa el mapa para usuarios únicos
  let uniqueUsers = new Map()

  // Inicializa global.conns si no existe o no es array
  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

  // Recorre todas las conexiones para agregar usuarios únicos
  global.conns.forEach((conn) => {
    if (conn.user && conn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(conn.user.jid, conn)
    }
  })

  // Cuenta total de bots conectados (usuarios únicos)
  let totalUsers = uniqueUsers.size
  let txt = '✿ Total Bots' + ` → *${totalUsers || 0}*`

  // Envía el mensaje de respuesta
  await conn.reply(m.chat, txt, m)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler
