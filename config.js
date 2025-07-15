import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

global.owner = [
  ['51942501966', 'Sung', true],
  ['51928303585', 'Sung', true],
]

global.sessions = 'Sessions'
global.bot = 'Serbot'
global.namebot = 'Anya Forger'
global.packname = 'LOVELLOUD'
global.author = 'Sung'

global.canal = 'https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M'
global.ch = {
  ch1: '120363403143798163@newsletter',
}

global.AFBots = true
global.mods = []
global.prems = []
global.multiplier = 69
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
