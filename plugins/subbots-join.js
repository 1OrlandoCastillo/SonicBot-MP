import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, text, isROwner }) => {
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Serbot', senderNumber)

  // Verificación unificada: solo el dueño del número del bot o el creador puede usar el comando
  if (senderNumber !== botActual && !isROwner) {
    return conn.reply(m.chat, `❖ El comando *join* solo puede ser usado por el dueño del número del *bot* o el *creador del sistema*.`, m, rcanal)
  }

  if (!text) {
    return conn.reply(m.chat, `✦ Necesito un enlace de invitación para poder unirme a un grupo.\n\nUsa el comando así:\n\n*#join* [enlace de grupo de WhatsApp]\n\n> LOVELLOUD Official`, m, rcanal)
  }

  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
  if (!match) {
    return conn.reply(m.chat, `✦ El enlace proporcionado no es válido.\n\nAsegúrate de copiarlo completo, cielo.`, m, rcanal)
  }

  const groupCode = match[1]

  try {
    await conn.groupAcceptInvite(groupCode)
    return conn.reply(m.chat, `✅ Me he unido al grupo con elegancia~\n\nGracias por invitarme 💖\n\n> LOVELLOUD Official`, m, rcanal)
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `❌ No pude unirme al grupo.\n\n* Revisa si el enlace sigue siendo válido\n* O si he sido expulsada antes\n\n> LOVELLOUD Official`, m, rcanal)
  }
}

handler.help = ['join <enlace>']
handler.tags = ['subbots']
handler.command = /^join$/i

export default handler