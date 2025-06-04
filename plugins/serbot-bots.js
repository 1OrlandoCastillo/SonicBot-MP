import ws from 'ws'

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
  let txt = `✿ *Total Bots* → *${totalUsers || 0}*\n\n`

  let count = 1
  for (let [jid, conn] of uniqueUsers.entries()) {
    let number = jid.split('@')[0]
    let name = conn.user?.name || 'Sin nombre'
    txt += `*${count}.* ${name} - wa.me/${number}\n`
    count++
  }

  await conn.reply(m.chat, txt, m, rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']
export default handler
