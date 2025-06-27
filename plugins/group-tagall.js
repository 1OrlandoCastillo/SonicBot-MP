const handler = async (m, { conn, participants, args }) => {
  const msj = args.join(' ') || '📣 *Atención a todos los miembros del grupo*';
  const texto = `${msj}\n\n` + participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
  await conn.sendMessage(m.chat, { text: texto, mentions: participants.map(p => p.id) }, m, rcanal);
};

handler.help = ['tagall <mensaje>'];
handler.tags = ['grupo'];
handler.command = ['tagall'];
handler.group = true;

export default handler;