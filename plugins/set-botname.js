//* Cdigo creado por Flix, no quites crditos *//

global.botNames = global.botNames || {}; // Por si no fue inicializado an

let handler = async (m, { conn, text, command }) => {
  // Verificar si el usuario es el socket activo
  const isSocketActive = conn.user.jid === m.sender;

  // Comando para cambiar el nombre del bot (solo permitido para el socket activo)
  if (!isSocketActive) {
    return await m.reply('Este comando solo puede ser usado por el socket.', m);
  }
  if (!text) {
    return await m.reply('Qu nombre deseas agregar al socket?', m);
  }
  global.botNames[conn.user.jid] = text.trim(); // Actualiza el nombre solo para esta sesin
  return await m.reply('El nombre fue actualizado con xito...', m);
};

handler.help = ['setname'];
handler.tags = ['subbots'];
handler.command = ['setname'];

export default handler;