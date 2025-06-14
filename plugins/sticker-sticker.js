import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import fluent from 'fluent-ffmpeg'
import { fileTypeFromBuffer as fromBuffer } from 'file-type'
import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, args }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || q.mediaType || ''
  let buffer

  try {
    if (/image|video/.test(mime) && q.download) {
      if (/video/.test(mime) && (q.msg || q).seconds > 10)
        return conn.reply(m.chat, '🎬 Máx. 10 segundos de video', m)
      buffer = await q.download()
    } else if (args[0] && isUrl(args[0])) {
      buffer = await (await fetch(args[0])).buffer()
    } else {
      return conn.reply(m.chat, '📌 Responde a una imagen o video corto', m)
    }

    await m.react('🕐')
    const webp = await toWebp(buffer)
    const sticker = await addExif(webp, global.packname, global.author)
    await conn.sendFile(m.chat, sticker, 'sticker.webp', '', m)
    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    console.error(e)
    conn.reply(m.chat, '❗ Error al crear el sticker', m)
  }
}

handler.command = ['s', 'sticker']
handler.tags = ['sticker']
handler.help = ['s']

export default handler

async function toWebp(buffer) {
  const { ext } = await fromBuffer(buffer)
  if (!/(png|jpe?g|mp4|mkv|m4p|gif|webp)/i.test(ext)) throw 'Formato no compatible'

  const tmp = global.tempDir || './tmp'
  const input = path.join(tmp, `${Date.now()}.${ext}`)
  const output = path.join(tmp, `${Date.now()}.webp`)
  fs.writeFileSync(input, buffer)

  const scale = `scale='if(gt(iw,ih),-1,299)':if(gt(iw,ih),299,-1)', crop=299:299`
  const opts = [
    '-vcodec', 'libwebp',
    '-vf', `${scale}, fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on [p]; [b][p] paletteuse`,
    ...(ext.match(/mp4|mkv|m4p|gif/) ? ['-loop', '0', '-ss', '00:00:00', '-t', '00:00:10', '-an', '-vsync', '0'] : [])
  ]

  return new Promise((resolve, reject) => {
    fluent(input)
      .addOutputOptions(opts)
      .toFormat('webp')
      .save(output)
      .on('end', () => {
        const result = fs.readFileSync(output)
        fs.unlinkSync(input)
        fs.unlinkSync(output)
        resolve(result)
      })
      .on('error', (err) => {
        fs.unlinkSync(input)
        reject(err)
      })
  })
}

function isUrl(str) {
  return /^https?:\/\/.+\.(jpe?g|gif|png|webp)$/.test(str)
}