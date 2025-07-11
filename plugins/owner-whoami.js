let handler = async (m, { isROwner, isOwner }) => {
  m.reply(`📌 Tu JID: ${m.sender}
✅ isROwner: ${isROwner}
✅ isOwner: ${isOwner}`)
}
handler.command = /^whoami$/i

export default handler