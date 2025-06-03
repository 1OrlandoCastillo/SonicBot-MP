let handler = async (m, { conn, args, usedPrefix, command, isROwner }) => {

let addte = `Ingresa el número del usuario que deseas añadir.`

if (!args[0]) return m.reply(addte, m.chat)

let user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
await conn.groupParticipantsUpdate(m.chat, [user], 'add')
m.reply(`Usuario añadido al grupo.`)
m.reply(`¡Has sido añadido al grupo!`, user)

}

handler.help = ['add *<número>*']
handler.tags = ['group']
handler.command = ['add', 'añadir'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
