import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, '¿Me regalas una URL válida, cielo?\nLa necesito para poder continuar\n\n* Solo así podré ir volando a capturar la imagen más bonita de esa página\n\n* Tú solo dame el enlace, y yo me encargo del resto, dulzura\n\nEjemplo:\n\n* .ss https://example.com\n\n* ss https://openai.com\n\n> LOVELLOUD Official', m, rcanal)
  try {
    const res = await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await conn.sendFile(m.chat, buffer, 'screenshot.png', '', m, null, { ...rcanal })
  } catch {}
}
handler.help = ['ss']
handler.tags = ['tools']
handler.command = /^ss(web)?f?$/i
export default handler
