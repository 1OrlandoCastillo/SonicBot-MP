let handler = async (m, { conn, usedPrefix, command, isAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '《✧》Este comando solo puede ser usado en grupos.',
    contextInfo: { ...rcanal.contextInfo }
  }, { quoted: m })

  if (!isAdmin) return conn.sendMessage(m.chat, {
    text: '《✧》Solo los administradores pueden usar este comando.',
    contextInfo: { ...rcanal.contextInfo }
  }, { quoted: m })

  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes responder a una imagen para establecerla como foto del grupo.\n\n*Uso:* Responde a una imagen con: ${usedPrefix + command}`,
      contextInfo: { ...rcanal.contextInfo }
    }, { quoted: m })
  }

  try {
    const imgBuffer = await q.download?.()
    if (!imgBuffer) return conn.sendMessage(m.chat, { text: '《✧》No pude descargar la imagen.', contextInfo: { ...rcanal.contextInfo } }, { quoted: m })

    await conn.updateProfilePicture(m.chat, imgBuffer)

    return conn.sendMessage(m.chat, {
      text: `╭─「 ✦ 𝗙𝗼𝘁𝗼 𝗱𝗲𝗹 𝗚𝗿𝘂𝗽𝗼 𝗔𝗰𝘁𝘂𝗮𝗹𝗶𝘇𝗮𝗱𝗮 ✦ 」─╮\n│\n╰➺ ✧ *Hecho por:* @${m.sender.split('@')[0]}\n╰➺ ✧ *Estado:* Cambiada correctamente ✅\n\n> LOVELLOUD Official`,
      contextInfo: { ...rcanal.contextInfo, mentionedJid: [m.sender] }
    }, { quoted: m })
  } catch (e) {
    console.error('Error cambiando foto del grupo:', e)
    return conn.sendMessage(m.chat, {
      text: '《✧》No se pudo cambiar la foto del grupo. Asegúrate de que la imagen sea válida y que el bot tenga permisos.',
      contextInfo: { ...rcanal.contextInfo }
    }, { quoted: m })
  }
}

handler.command = ['photogp']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
