import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })

  const isROwner = global.owner?.some(([id]) => m.sender === (id + '@s.whatsapp.net') || m.sender === id)

  if (!isROwner) {
    await conn.reply(m.chat, '🚫 Este comando es solo para los dueños del bot.', m)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return
  }

  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
    await conn.reply(m.chat, `✅ Bot actualizado correctamente:\n\n${stdout.toString()}`, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.reply(m.chat, `⚠️ El dueño ejecutó el comando pero ocurrió un error:\n\n${err.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']

export default handler
