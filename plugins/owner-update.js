import { execSync } from 'child_process'

let handler = async (m, { conn, text, isROwner }) => {
  await m.react('🕓')

  if (!isROwner) {
    await conn.reply(m.chat, '✖️ Este comando solo puede ser utilizado por el *Creador* de la Bot.', m)
    await m.react('❌')
    return
  }

  try {
    let stdout = execSync('git pull' + (text ? ' ' + text : ''))
    await conn.reply(m.chat, stdout.toString(), m)
    await m.react('✅')
  } catch (err) {
    await conn.reply(m.chat, `❌ Ocurrió un error:\n\n${err.toString()}`, m)
    await m.react('❌')
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler
