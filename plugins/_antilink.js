let handler = async (m, { conn, isAdmin, isBotAdmin, groupMetadata }) => {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const regex = /(https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)/gi;

  if (regex.test(m.text)) {
    const sender = m.sender;
    const participants = groupMetadata.participants || [];

    const isSenderAdmin = participants.find(p => p.id === sender)?.admin;

    if (!isSenderAdmin) {
      await conn.reply(m.chat, `🚫 *Enlaces de grupo no están permitidos.*`, m);
      await conn.sendMessage(m.chat, {
        delete: m.key
      });

      try {
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove');
      } catch (e) {
        await conn.reply(m.chat, `❗ No se pudo expulsar a @${sender.split('@')[0]}`, m, {
          mentions: [sender]
        });
      }
    }
  }
};

handler.group = true;
handler.botAdmin = true;

export default handler;