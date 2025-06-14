let handler = async (m, { args, text }) => {
  if (!text) return m.reply(`✳️ Ingresa el nombre que deseas ponerle al bot. 📌 Ejemplo:
.setbotname Bot`);

  global.db.data.users[m.sender].namebot = text.trim();
  m.reply(`✅ Has personalizado el nombre del bot. 📛 Nuevo nombre: *${text.trim()}*`);
};

handler.help = ['setbotname <nombre>'];
handler.tags = ['tools'];
handler.command = ['setbotname'];

export default handler;
