import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomBytes } from 'crypto'

function tmpFile(ext = '') {
  return join(tmpdir(), `${randomBytes(6).toString('hex')}.${ext}`)
}

function execFile(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args)
    proc.on('error', reject)
    proc.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

export async function sticker(buffer, isVideo = false, packname = '', author = '') {
  const inputPath = tmpFile(isVideo ? 'mp4' : 'jpg')
  const webpPath = tmpFile('webp')
  const finalPath = tmpFile('webp')
  const exifPath = tmpFile('exif')

  await fs.writeFile(inputPath, buffer)

  const ffmpegArgs = isVideo
    ? [
        '-y', '-i', inputPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
        '-loop', '0',
        '-ss', '00:00:00',
        '-t', '00:00:07',
        '-preset', 'default',
        '-an', '-vsync', '0',
        '-s', '512x512',
        '-vcodec', 'libwebp',
        webpPath
      ]
    : [
        '-y', '-i', inputPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-qscale', '75',
        '-preset', 'default',
        '-loop', '0',
        '-an', '-vsync', '0',
        webpPath
      ]

  await execFile('ffmpeg', ffmpegArgs)

  const exif = createExif(packname, author)
  await fs.writeFile(exifPath, exif)

  await execFile('webpmux', ['-set', 'exif', exifPath, webpPath, '-o', finalPath])

  const finalSticker = await fs.readFile(finalPath)

  await fs.unlink(inputPath).catch(() => {})
  await fs.unlink(webpPath).catch(() => {})
  await fs.unlink(exifPath).catch(() => {})
  await fs.unlink(finalPath).catch(() => {})

  return finalSticker
}

function createExif(packname = '', author = '') {
  const exifAttr = {
    'sticker-pack-id': 'com.starcor.sticker',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'android-app-store-link': '',
    'ios-app-store-link': ''
  }

  const json = JSON.stringify(exifAttr)
  const buffer = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2A, 0x00]),
    Buffer.from([0x08, 0x00, 0x00, 0x00]),
    Buffer.from('Extended EXIF', 'utf-8'),
    Buffer.from([0x00]),
    Buffer.from([0x16, 0x00, 0x00, 0x00]),
    Buffer.from(json)
  ])

  return buffer
}
