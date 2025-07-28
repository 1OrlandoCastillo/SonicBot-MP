let handler = async (m, { quoted }) => {
  if (!quoted || !/image|video/.test(quoted.mimetype)) throw '✦ Cita una imagen o video para convertir a sticker.'
  // Lógica para crear sticker
  m.reply('✦ Generando tu sticker...')
}
handler.command = /^sticker|s|stickers$/i
export default handler