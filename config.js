import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['51942501966', 'Sung', true],
  ['51928303585', 'Sung', true],
]

global.libreria = 'MayBailyes'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.nameqr = 'SoyMaycol'
global.namebotttt = 'MaycolAIUltraMD'
global.namebot = '𝐌𝐚𝐲𝐜𝐨𝐥𝐀𝐈𝐔𝐥𝐭𝐫𝐚-𝐌𝐃'
global.personaje = 'Hanako Kun'
global.sessions = './MayBots/Principal'
global.jadi = 'MayBots'
global.yukiJadibts = true

global.sessions = 'Sessions'
global.bot = 'Serbot' 
global.AFBots = true

global.packname = 'LOVELLOUD'
global.namebot = 'Anya Forger'
global.author = 'Sung'


global.canal = 'https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M'

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
