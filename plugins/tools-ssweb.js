import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
if (!args[0]) return conn.reply(m.chat,'Este comando requiere que proporciones una URL válida para poder continuar.', m, rcanal)
await m.react('🕓')
try {
    const res = await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await conn.sendFile(m.chat, buffer, 'screenshot.png', '', m, null, { ...rcanal })
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['ss']
handler.tags = ['tools']
handler.command = /^ss(web)?f?$/i
export default handler
