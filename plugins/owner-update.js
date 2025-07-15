import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  await m.react('🕓')

  const isROwner = global.owner?.some(([id]) => m.sender === (id + '@s.whatsapp.net') || m.sender === id)

  if (!isROwner) {
    await conn.reply(m.chat, '🚫 Este comando es solo para los dueños del bot.', m)
    await m.react('❌')
    return
  }

  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
    await conn.reply(m.chat, `✅ Bot actualizado correctamente:\n\n${stdout.toString()}`, m)
    await m.react('✅')
  } catch (err) {
    await conn.reply(m.chat, `⚠️ Comando ejecutado por un dueño, pero ocurrió un error:\n\n${err.message}`, m)
    await m.react('⚠️')
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']

export default handler
