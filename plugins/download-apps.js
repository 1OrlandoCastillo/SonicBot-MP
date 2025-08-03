import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Ingresa el nombre de la aplicación que deseas descargar.
      
> Ejemplo: ${usedPrefix}apk Whatsapp`,
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
        text: `《✧》No se encontró la aplicación intenta con otro nombre.`,
        contextInfo: {
          ...rcanal.contextInfo
        }
      }, { quoted: m })
      return
    }

    const appData = data.data

    
    const appInfo = `✐ Nombre: ${appData.name}
ⴵ Paquete: ${appData.package}
✰ Tamaño: ${appData.size}
❒ Actualizado: ${appData.lastup}`

    
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
      
    
      const fallbackInfo = `✧ Nombre: ${appData.name}
ⴵ Paquete: ${appData.package}
✰ Tamaño: ${appData.size}
❖ Actualizado: ${appData.lastup}
❏ Enlace de descarga: ${appData.dllink}`

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
      text: `《✧》Error al buscar la aplicación intenta nuevamente más tarde.`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.command = ['aptoide', 'descargar', 'apk']

export default handler