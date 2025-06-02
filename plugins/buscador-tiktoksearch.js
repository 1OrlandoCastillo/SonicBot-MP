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
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    const searchResults = data.data;

    if (!searchResults || searchResults.length === 0) {
      return conn.reply(message.chat, "⚠︎ No se encontraron resultados para tu búsqueda.", message);
    }

    shuffleArray(searchResults);
    const topResults = searchResults.slice(0, 7); // 7 videos como máximo

    for (const result of topResults) {
      if (result.nowm) {
        await conn.sendMessage(message.chat, {
          video: { url: result.nowm },
          caption: result.title || "🎵 Video de TikTok"
        }, { quoted: message });
      }
    }

  } catch (error) {
    console.error(error);
    conn.reply(message.chat, `⚠︎ Ocurrió un error: ${error.message}`, message);
  }
};

handler.help = ["tiktoksearch <texto>"];
handler.tags = ["buscador"];
handler.command = ["tiktoksearch", "ttss", "tiktoks"];

export default handler;
