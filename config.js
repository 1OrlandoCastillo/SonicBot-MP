import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// 👑 Dueños
global.owner = [
  ['5212731590195', 'White', true],
  ['12543120750', 'adri', true],
]

global.ownerLid = [
  ['5212731590195', 'White', true],
  ['5212731590195', 'White2', true],
]

// ⚙️ Configuración del bot
global.sessions = 'Sessions'
global.bot = 'Serbot'
global.AFBots = true

global.packname = 'LOVELLOUD'
global.namebot = 'KIYOMI MD'
global.author = 'Sung'

// 📢 Canales y newsletters
global.canal = 'https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M'
global.ch = {
  ch1: '120363403143798163@newsletter',
}

// 🔧 Otros
global.mods = []
global.prems = []
global.multiplier = 69
global.maxwarn = 2

// 📌 Auto-reload del archivo
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})