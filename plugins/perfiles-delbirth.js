let handler = async (m) => {
  if (!global.db.data.users[m.sender].birth) throw '《✧》No tienes un cumpleaños registrado por el momento.'
  delete global.db.data.users[m.sender].birth
  return conn.reply(m.chat, `
「✐」Se ha eliminado tu cumpleaños correctamente.`, m, rcanal)
}
handler.command = /^delbirth$/i
export default handler