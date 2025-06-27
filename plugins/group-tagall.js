const handler = async (m, { conn, participants, args }) => {
  let txt = `\n`;
  txt += participants.map(p => `@${p.id.split('@')[0]}`).join('\n');

  const rcanal = {
    mentions: participants.map(p => p.id),
    contextInfo: {
      mentionedJid: participants.map(p => p.id)
    }
  };

  await conn.sendMessage(m.chat, txt, m, rcanal);
};

handler.help = ['tagall <mensaje>'];
handler.tags = ['grupo'];
handler.command = ['tagall'];
handler.group = true;

export default handler;
