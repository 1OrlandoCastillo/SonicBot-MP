import axios from 'axios';

let handler = async (message, { conn, text }) => {
  if (!text) {
    return conn.reply(message.chat, "❀ Por favor, ingrese un texto para realizar una búsqueda en TikTok.", message);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    let { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    let searchResults = data.data;

    if (!searchResults || searchResults.length === 0) {
      return conn.reply(message.chat, "⚠︎ No se encontraron resultados para tu búsqueda.", message);
    }

    shuffleArray(searchResults);
    let topResults = searchResults.slice(0, 7); // Hasta 7 resultados

    let responseText = `✧ *Resultados de TikTok para:* ${text}\n\n`;

    topResults.forEach((result, index) => {
      responseText += `*${index + 1}.* ${result.title || 'Sin título'}\n`;
      responseText += `📎 ${result.nowm}\n\n`;
    });

    conn.reply(message.chat, responseText.trim(), message);

  } catch (error) {
    console.error(error);
    conn.reply(message.chat, `⚠︎ Ocurrió un error: ${error.message}`, message);
  }
};

handler.help = ["tiktoksearch <texto>"];
handler.tags = ["buscador"];
handler.command = ["tiktoksearch", "ttss", "tiktoks"];

export default handler;
