import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩📱𓆪 ᴅᴇsᴄᴀʀɢᴀ ✦ 」─╮
│
╰➺ ✧ *Uso:* ${usedPrefix}aptoide <nombre de la app>
╰➺ ✧ *Ejemplo:* ${usedPrefix}aptoide whatsapp
╰➺ ✧ *Ejemplo:* ${usedPrefix}aptoide instagram
╰➺ ✧ *Ejemplo:* ${usedPrefix}aptoide tiktok
│
╰────────────────╯
> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }

  const query = text.trim()
  
  try {

  
    const apiUrl = `https://bytebazz-api.koyeb.app/api/download/aptoide?query=${encodeURIComponent(query)}&apikey=8jkh5icbf05`
    const { data } = await axios.get(apiUrl)

    if (!data.status) {
      await conn.sendMessage(m.chat, {
        text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮
│
╰➺ ✧ *No se encontró la aplicación*
╰➺ ✧ *Intenta con otro nombre*
╰➺ ✧ *O verifica la ortografía*
│
╰────────────────╯
> LOVELLOUD Official`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      return
    }

    const appData = data.data

    
    const appInfo = `╭─「 ✦ 𓆩📱𓆪 ✦ 」─╮
│
╰➺ ✧ *Nombre:* ${appData.name}
╰➺ ✧ *Paquete:* ${appData.package}
╰➺ ✧ *Tamaño:* ${appData.size}
╰➺ ✧ *Actualizado:* ${appData.lastup}
│
╰────────────────╯
> LOVELLOUD Official`

    
    try {
      const apkResponse = await axios.get(appData.dllink, { responseType: 'arraybuffer' })
      const apkBuffer = Buffer.from(apkResponse.data)
      
      
      await conn.sendMessage(m.chat, {
        document: apkBuffer,
        fileName: `${appData.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: appInfo,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      
    } catch (apkError) {
      console.error('Error descargando APK:', apkError)
      
    
      const fallbackInfo = `╭─「 ✦ 𓆩📱𓆪 ✦ 」─╮
│
╰➺ ✧ *Nombre:* ${appData.name}
╰➺ ✧ *Paquete:* ${appData.package}
╰➺ ✧ *Tamaño:* ${appData.size}
╰➺ ✧ *Actualizado:* ${appData.lastup}
│
╰➺ ✧ *Enlace de descarga:*
╰➺ ✧ ${appData.dllink}
> LOVELLOUD Official`

      await conn.sendMessage(m.chat, {
        text: fallbackInfo,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
    }

  } catch (error) {
    console.error('Error en comando download-apps:', error)
    
    await conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𓆩❌𓆪 ᴇʀʀᴏʀ ✦ 」─╮
│
╰➺ ✧ *Error al buscar la aplicación*
╰➺ ✧ *Posibles causas:*
╰➺ ✧ • Nombre incorrecto
╰➺ ✧ • Problema de conexión
╰➺ ✧ *Intenta nuevamente más tarde*
│
╰────────────────╯
> LOVELLOUD Official`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['aptoide <app>', 'descargar <app>', 'apk <app>']
handler.tags = ['descargas']
handler.command = /^(aptoide|descargar|apk)$/i

export default handler 