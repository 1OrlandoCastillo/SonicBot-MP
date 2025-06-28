//* Código creado por Félix, no quites créditos *//

global.botNames = global.botNames || {}; // Por si no fue inicializado aún

let handler = async (m, { conn, text, command }) => {
  try {
    // Validación de estructura básica
    if (!conn?.user?.jid || typeof conn.user.jid !== 'string') {
      return await m.reply('✘ Error interno: El socket aún no está completamente inicializado.', m);
    }

    if (!m?.sender || typeof m.sender !== 'string') {
      return await m.reply('✘ Error interno: No se pudo detectar el remitente.', m);
    }

    const isSocketActive = conn.user.jid === m.sender;

    // Solo el socket puede usar este comando
    if (!isSocketActive) {
      return await m.reply('「🩵」Este comando solo puede ser usado por el socket.', m);
    }

    if (!text) {
      return await m.reply('「🩵」¿Qué nombre deseas agregar al socket?', m);
    }

    global.botNames[conn.user.jid] = text.trim(); // Guardamos nombre personalizado por sesión

    return await m.reply('「🩵」El nombre fue actualizado con éxito...', m);
  } catch (e) {
    return await m.reply(`✘ Ocurrió un error al ejecutar el comando:\n\n${e}`, m);
  }
};

handler.help = ['setname'];
handler.tags = ['subbots'];
handler.command = ['setname'];

export default handler;
