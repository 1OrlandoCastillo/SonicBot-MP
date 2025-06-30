import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
if (!args[0]) return conn.reply(m.chat,'Este comando requiere que proporciones una URL válida para poder continuar.', m, rcanal)
await m.react('🕓')
try {
let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()
conn.sendFile(m.chat, ss, 'error.png', m, null, rcanal)
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['ss']
handler.tags = ['tools']
handler.command = /^ss(web)?f?$/i
export default handler