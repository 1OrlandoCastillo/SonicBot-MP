import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'


global.owner = [
  ['51928303585', 'Samsit', true],
  ['522731590195', 'White444', true]
]


global.mods = []
global.prems = []


global.namebot = 'Anya Forger'
global.author = 'Samsit'


global.namecanal = 'Prueba'
global.canal = 'https://whatsapp.com/channel/0029VaeQcFXEFeXtNMHk0D0n'
global.idcanal = '120363274577422945@newsletter'


global.multiplier = 69 
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
