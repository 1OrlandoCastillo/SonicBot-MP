import ws from 'ws'

let handler = async (m, { conn, usedPrefix, command }) => {
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

  // Listar todos los usuarios con su jid y nombre
  for (let [jid, conn] of uniqueUsers.entries()) {
    // Intentamos obtener el nombre, si no hay, mostrar jid
    let name = conn.user.name || conn.user.pushname || 'Desconocido'
    txt += `- ${name} (${jid})\n`
  }

  await conn.reply(m.chat, txt, m)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler
