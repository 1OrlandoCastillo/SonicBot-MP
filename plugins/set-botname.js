.let handler = async (m, { args, conn }) => {
  if (!args[0]) return m.reply('✳️ Ingresa el nuevo nombre del bot.\n\nEjemplo:\n.setbotname Bot');
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {};
  global.db.data.settings[conn.user.jid].namebot = args.join(" ");
  m.reply(`✅ El nombre del bot ha sido cambiado a:\n*${args.join(" ")}*`);
};
handler.command = ['setbotname'];
export default handler;
