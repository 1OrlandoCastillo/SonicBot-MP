import ws from 'ws'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) {
    global.conns = []
  }

  global.conns.forEach((botConn) => {
    if (botConn.user && botConn.ws?.socket?.readyState !== ws.CLOSED) {
      uniqueUsers.set(botConn.user.jid, botConn)
    }
  })

  let totalUsers = uniqueUsers.size
  let index = 1
  let txt = `╭───❖「 *SUBBOTS CONECTADOS* 」\n│\n`
  txt += `│ ✿ Total de bots: *${totalUsers}*\n│\n`

  for (let [jid, botConn] of uniqueUsers.entries()) {
    let name = botConn.user?.name || 'Sin nombre'
    let number = jid.split('@')[0]
    msg += `│ ${index++}. *${name}*\n│     📞 Número: wa.me/${number}\n`
  }

  msg += `╰───────────────⬣`

  await conn.reply(m.chat, txt, m, rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler
