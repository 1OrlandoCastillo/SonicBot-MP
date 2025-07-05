import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['51942501966', 'Sung', true],
  ['51928303585', 'Sung', true],
]

global.libreria = 'Baileys'
global.baileys = 'V 6.7.18' 
global.vs = '1.0.0'
global.sessions = 'Sessions'
global.jadi = 'SubBots' 
global.ForgerJadibts = true

global.packname = 'LOVELLOUD'
global.namebot = 'Anya Forger'
global.author = 'Sung'

global.namecanal = 'LOVELLOUD'
global.canal = 'https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M'
global.idcanal = '120363403143798163@newsletter'

global.ch = {
ch1: '120363403143798163@newsletter',
}

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
