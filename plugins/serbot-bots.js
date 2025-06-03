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
   let txt = `*Lista De Sub-Bots*\n\n• *Bot Principal →* 1\n• *Bots Totales →* ${totalUsers || 0}\n\n> *No asumimos responsabilidad alguna por los sub-bots y sus acciones.*`

   await conn.reply(m.chat, txt, m, rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']
export default handler
