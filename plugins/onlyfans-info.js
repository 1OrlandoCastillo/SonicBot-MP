import axios from 'axios'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩👤𓆪 ᴏɴʟʏғᴀɴs ɪɴғᴏ ✦ 」─╮
│
╰➺ ✧ *Uso:* ${usedPrefix}onlyfans <username>
╰➺ ✧ *Ejemplo:* ${usedPrefix}onlyfans arigame
╰➺ ✧ *Ejemplo:* ${usedPrefix}onlyfans username123
│
╰➺ ✧ *¿Qué hace?*
╰➺ ✧ Busca información pública de perfiles de OnlyFans
╰➺ ✧ Muestra datos como avatar, descripción, estadísticas
│
╰────────────────╯
> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }

  const username = text.trim().toLowerCase()
  
  try {
   
    const apiUrl = `https://bytebazz-api.koyeb.app/api/busqueda/onlyfans?username=${encodeURIComponent(username)}&apikey=8jkh5icbf05`
    const { data } = await axios.get(apiUrl)

    if (!data.status) {
      await conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮
│
╰➺ ✧ *No se encontró el usuario*
╰➺ ✧ *Verifica el username*
╰➺ ✧ *O el perfil puede ser privado*

> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      return
    }

    const userData = data.user
    
   
    const userInfo = `╭─「 ✦ 𓆩👤𓆪 ${userData.name} ✦ 」─╮
│
╰➺ ✧ *Nombre:* ${userData.name}
╰➺ ✧ *Username:* @${userData.username}
╰➺ ✧ *ID:* ${userData.id}
╰➺ ✧ *Verificado:* ${userData.isVerified ? 'Sí ✅' : 'No ❌'}
│
╰➺ ✧ *Descripción:*
╰➺ ✧ ${userData.about || 'Sin descripción'}
│
╰➺ ✧ *Estadísticas:*
╰➺ ✧ • Posts: ${userData.postsCount || 0}
╰➺ ✧ • Fotos: ${userData.photosCount || 0}
╰➺ ✧ • Videos: ${userData.videosCount || 0}
╰➺ ✧ • Audios: ${userData.audiosCount || 0}
╰➺ ✧ • Total: ${userData.mediasCount || 0}
│
╰➺ ✧ *Información adicional:*
╰➺ ✧ • Fecha de registro: ${new Date(userData.joinDate).toLocaleDateString()}
╰➺ ✧ • Última vez visto: ${new Date(userData.lastSeen).toLocaleDateString()}
╰➺ ✧ • Contenido adulto: ${userData.isAdultContent ? 'Sí 🔞' : 'No ✅'}
╰➺ ✧ • Precio suscripción: $${userData.subscribePrice || 0}
│
╰➺ ✧ *Enlaces:*
╰➺ ✧ • [Website] (${userData.website})

> LOVELLOUD Official`

   
    if (userData.avatar) {
      try {
        const avatarResponse = await axios.get(userData.avatar, { responseType: 'arraybuffer' })
        const avatarBuffer = Buffer.from(avatarResponse.data)
        
        await conn.sendMessage(m.chat, {
          image: avatarBuffer,
          caption: userInfo,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      } catch (avatarError) {
        console.error('Error descargando avatar:', avatarError)
        
       
        await conn.sendMessage(m.chat, {
          text: userInfo,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      }
    } else {
    
      await conn.sendMessage(m.chat, {
        text: userInfo,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

   
    if (userData.header) {
      try {
        const headerResponse = await axios.get(userData.header, { responseType: 'arraybuffer' })
        const headerBuffer = Buffer.from(headerResponse.data)
        
        await conn.sendMessage(m.chat, {
          image: headerBuffer,
          caption: `╰➺  Su Banner *${userData.name}*`,
          contextInfo: {
            ...rcanal.contextInfo
          }
        }, { quoted: m })
      } catch (headerError) {
        console.error('Error descargando header:', headerError)
      }
    }

  } catch (error) {
    console.error('Error en comando onlyfans-info:', error)
    
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮
│
╰➺ ✧ *Error al buscar el usuario*
╰➺ ✧ *Posibles causas:*
╰➺ ✧ • Username incorrecto
╰➺ ✧ • Problema de conexión
╰➺ ✧ • API no disponible
│
╰➺ ✧ *Intenta nuevamente más tarde*

> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['onlyfans <username>', 'of <username>', 'onlyfansinfo <username>']
handler.tags = ['búsquedas']
handler.command = ['onlyfans', 'of', 'onlyfansinfo']

export default handler 