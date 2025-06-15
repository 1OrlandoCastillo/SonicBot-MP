let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`✳️ Escribe el nombre que deseas darle a tu SubBot.  Ejemplo:
.setbotname Bot`);

  global.subBots = global.subBots || {};
  const jid = conn.user.jid;

  if (!global.subBots[jid])
    return m.reply('Este bot no es un subbot generado con `.code`');

  if (global.subBots[jid].owner !== m.sender)
    return m.reply('⛔ Solo el dueño del SubBot puede cambiar su nombre.');

  global.subBots[jid].namebot = text.trim();
  return m.reply(`✅ Nombre del SubBot actualizado a: *${text.trim()}*`);
};

handler.help = ['setbotname']
handler.tags = ['set']
handler.command = ['setbotname']
export default handler;
