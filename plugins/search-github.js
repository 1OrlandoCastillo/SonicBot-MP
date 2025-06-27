import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `🚩 Para poder ayudarte correctamente, debes escribir el nombre, palabra clave o tecnología que deseas buscar en GitHub.`, m, rcanal)
  
await m.react('🕓')
let img = './storage/img/menu.jpg'

try {
const { data } = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=10`)

const results = data.items || []

if (results.length > 0) {
  let txt = `「 *• Searchs* 」`

  for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
    const repo = results[i]
     txt += `\n\n`
     txt += `*◦ Repositorio →* ${repo.full_name}`
     txt += `\n*◦ Descripción →* ${repo.description || 'Sin descripción'}`
     txt += `\n*◦ Estrellas →* ${repo.stargazers_count}`
      }

await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await m.react('✅')
} catch {
await m.react('✖️')
}}

handler.tags = ['search']
handler.help = ['githubsearch']
handler.command = ['githubsearch', 'ghsearch', 'gitsearch']

export default handler