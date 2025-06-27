import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args || !args[0]) return conn.reply(m.chat, 'Para poder procesar tu solicitud, necesitas copiar y pegar el link directo del video de TikTok que deseas descargar.', m, rcanal)
  await m.react('🕓')
try {
const res = await fetch(`https://g-mini-ia.vercel.app/api/tiktok?url=${encodeURIComponent(args[0])}`)
if (!res.ok) return
const json = await res.json()
if (!json || !json.video_url) return
const { video_url, title, author } = json
let txt = `\n`
   txt += `Título: ${title}\n`
   txt += `Autor: ${author}`
await conn.sendFile(m.chat, video_url, 'tiktok.mp4', txt, m)
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['tiktok']
handler.tags = ['downloader']
handler.command = /^(tiktok|tt|tiktokdl|ttdl)$/i

export default handler
