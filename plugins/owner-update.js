import { execSync } from 'child_process'

let handler = async (m, { conn, text, isROwner }) => {
  if (!isROwner) throw '✤ Hola, este comando solo puede ser utilizado por el *Creador* de la Bot.'

  await m.react('🕓')
  let stdout
  try {
    stdout = execSync('git pull' + (text ? ' ' + text : ''))
  } catch (e) {
    stdout = e.stdout || e
  }

  await conn.reply(m.chat, stdout.toString(), m)
  await m.react('✅')
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed'] 
handler.rowner = false // ❗Esto es muy importante

export default handler
