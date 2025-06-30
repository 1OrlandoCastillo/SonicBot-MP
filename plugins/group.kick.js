let handler = async (m, { conn, args, participants }) => {
  if (!m.isGroup) return m.reply('Parece que estás intentando usar una función que está limitada únicamente a chats grupales.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender)
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner

  if (!isUserAdmin) return m.reply('Esta función está reservada para quienes tienen permisos especiales dentro del grupo.')

  let user
  if (m.mentionedJid?.[0]) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else if (args[0]) {
    const number = args[0].replace(/[^0-9]/g, '')
    user = number + '@s.whatsapp.net'
  } else {
    if (!text) return conn.reply(m.chat, `Para que el bot pueda procesar la expulsión correctamente, necesitas identificar al usuario.`)
  }

  const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot = global.owner?.[0]?.[0] + '@s.whatsapp.net'

  if (user === conn.user.jid) return m.reply(`Parece que intentaste usar el comando para eliminarte del grupo, pero eso no está permitido.`)
  if (user === ownerGroup) return m.reply(`El propietario del grupo tiene permisos especiales y no puede ser removido por el bot ni por otros administradores.`)
  if (user === ownerBot) return m.reply(`El propietario principal del bot tiene permisos especiales y está protegido contra este tipo de comandos.`)

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    await m.reply(`La persona mencionada ha sido expulsada correctamente del grupo por solicitud de un administrador.`)
  } catch (e) {
    await m.reply(`Parece que no tengo los permisos necesarios para realizar esta acción.`)
  }
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'expulsar', 'echar', 'ban', 'sacar']

export default handler
