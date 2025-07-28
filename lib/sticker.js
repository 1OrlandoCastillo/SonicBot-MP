import { spawn } from 'child_process'
import path from 'path'
import { tmpdir } from 'os'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { join } from 'path'
import { randomBytes } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function tmpFile(ext = '') {
  return join(tmpdir(), `${randomBytes(6).toString('hex')}.${ext}`)
}

export async function sticker(inputBuffer, isVideo = false, packname = '', author = '') {
  const inputPath = tmpFile(isVideo ? 'mp4' : 'jpg')
  const outputPath = tmpFile('webp')

  await fs.writeFile(inputPath, inputBuffer)

  const webpCmd = [
    '-y',
    '-i', inputPath,
    '-vf', "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
    '-vcodec', 'libwebp',
    '-lossless', '1',
    '-qscale', '75',
    '-preset', 'default',
    '-loop', '0',
    '-an',
    '-vsync', '0',
    outputPath
  ]

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', webpCmd)
    ffmpeg.on('error', reject)
    ffmpeg.on('exit', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with ${code}`)))
  })

  const webp = await fs.readFile(outputPath)

  await fs.unlink(inputPath).catch(() => {})
  await fs.unlink(outputPath).catch(() => {})

  return webp
}
