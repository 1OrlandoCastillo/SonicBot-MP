//* Cdigo creado por Flix, no quites crditos *//

global.botNames = global.botNames || {}; // Por si no fue inicializado an

let handler = async (m, { conn, text, command }) => {
  const isSocketActive = conn.user.jid === m.sender;

  if (!isSocketActive) {
    return await m.reply('Este comando solo puede ser usado por el socket.', m);
  }

  if (!text) {
    return await m.reply('Qu nombre deseas agregar al socket?', m);
  }

  global.botNames[conn.user.jid] = text.trim();
  await m.reply('El nombre fue actualizado con xito...', m);
};

handler.help = ['setname'];
handler.tags = ['serbot'];
handler.command = ['setname'];

export default handler;