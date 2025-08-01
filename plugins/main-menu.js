import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
  try {
    let nombreBot = global.namebot || 'KIYOMI MD'
    let imgBot = './storage/img/menu3.jpg'
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    const tipo = botActual === '+51958333972'.replace(/\D/g, '') ? 'Principal Bot' : 'Sub Bot'

    const text = `
Hola! soy ${nombreBot}  
(${tipo})


╭─〔 ✦ 𓆩👑𓆪  ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏs ✦ 〕─╮
│  ꒷ꕤ  Dueños del bot:
│
╰➺ +51942501966 (Sung)

╰➺ +51901437507 (Sunkovv)


╭─〔 ✦ 𓆩💎𓆪  ᴄᴀɴᴀʟᴇs ᴏғɪᴄɪᴀʟᴇs ✦ 〕─╮
│  ꒷ꕤ  Accede aquí:
│
╰➺ https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M

╰➺ https://whatsapp.com/channel/0029Vb5Vinf72WTo11c5hJ3O

𝗔𝗾𝘂𝗶 𝘁𝗶𝗲𝗻𝗲𝘀 𝗹𝗮 𝗹𝗶𝘀𝘁𝗮 𝗱𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼𝘀:

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Sub-bots* 𖤓

✧ Comandos para crear, enlazar y gestionar tu propio bot personal.


𝆬✦.#qr
𝆬✦.#code
𝆬✦.#bots
𝆬✦.#botinfo • infobot
𝆬✦.#reconnect
𝆬✦.#setbotname
𝆬✦.#setbotimg
𝆬✦.#setautoread
→ Obtener información única y original del bot

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Economía* 𖤓

✧ Comandos para trabajar, jugar y hacer dinero con estilo.


𝆬✦#balance
𝆬✦#bal
𝆬✦#coins

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Perfiles* 𖤓

✧ Comandos para ver, personalizar y destacar tu perfil.


𝆬✦.#allbirthdays • #allbirths
→ Consulta el calendario de cumpleaños de los usuarios
𝆬✦.#birthdays • #cumpleaños • #births
→ Revisa quién está por celebrar su día
𝆬✦.#delbirth + [fecha]
→ Borra tu fecha de nacimiento de tu perfil
𝆬✦.#delgenre
→ Elimina tu género del perfil
𝆬✦.#profile • #perfil
→ Revisa tu perfil completo con estadísticas y logros
𝆬✦.#setbirth + [fecha]
→ Guarda tu fecha de nacimiento en tu perfil de usuario
𝆬✦.#setdescription • #setdesc + [Descripción]
→ Establece una descripción única para tu perfil
𝆬✦.#setfav • #setfavourite + [Personaje]
→ Establece tu personaje o ídolo favorito en tu perfil.
𝆬✦.#setgenre + Hombre | Mujer
→ Establece tu género para personalizar tu experiencia

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Busquedas* 𖤓

✧ Comandos para buscar contenido.


𝆬✦.#google <búsqueda>
𝆬✦.#yt <búsqueda>
𝆬✦.#tiktok <búsqueda>

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Tops* 𖤓

✧ Tops del grupos


𝆬✦.#topgays
𝆬✦.#topfeos
𝆬✦.#toplindos
𝆬✦.#topburros
𝆬✦.#topmachos
𝆬✦.#topparejas
𝆬✦.#toppajeros
𝆬✦.#topmancos


➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Nsfw* 𖤓

✧ Comandos para obtener imagenes  de anime +18


𝆬✦.#neko
𝆬✦.#waifu
𝆬✦.#waifu2

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Descargas* 𖤓

✧ Comandos para obtener música, videos y más desde distintas fuentes.

𝆬✦.#play <query> o <url>


➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Administración* 𖤓

✧ Comandos exclusivos para gestionar y moderar grupos.

✦.#delete
✦.#del
𝆬✦.#ban @usuario
𝆬✦.#demote @usuario
𝆬✦.#promote @usuario
𝆬✦.#tag
✦.#clear

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Inteligencia Artificial* 𖤓

✧ Comandos para consultar a los modelos de IA.


𝆬✦.#gemini <texto>

➺ 𖦹 ִֶָ𐀔 ₊˚ ༘⋆  *Stickers* 𖤓

✧ Comandos para crear, editar y divertirte con tus stickers.


𝆬✦.#delstickermeta • #delmeta
→ Restablece el pack y autor por defecto de tus stickers
𝆬✦.#setstickermeta • #setmeta + [autor] | [pack]
→ Define el autor y nombre del pack para tus stickers
𝆬✦.#sticker • #s • #stickers + {imagen/video o link}
𝆬✦.#toimg
    `.trim()

    await conn.sendFile(m.chat, imgBot, 'thumbnail.jpg', text, m, null, rcanal)

  } catch (e) {
    conn.reply(m.chat, '❎ Hubo un error al mostrar el menú.', m)
    throw e
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler
