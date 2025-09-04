import { execSync } from 'child_process'

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('*[❗] Solo los dueños pueden usar este comando.*')
  }

  // función para reaccionar
  m.react = async emoji => {
    await conn.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: m.key
      }
    })
  }

  await m.react('🕓')

  try {
    // Ejecutar git pull
    let stdout = execSync('git pull' + (text ? ' ' + text : ''))
    await conn.reply(m.chat, stdout.toString(), m)
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, `❌ Error:\n\n${e.message}`, m)
    await m.react('❌')
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.rowner = true

export default handler