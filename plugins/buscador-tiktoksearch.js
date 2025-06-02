import axios from 'axios';
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(message.chat, "❀ Por favor, ingrese un texto para realizar una búsqueda en TikTok.", message);
  }

  // Utilidad para barajar los resultados
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Función para crear el mensaje de video
  async function createVideoMessage(url) {
    const { videoMessage } = await generateWAMessageContent({
      video: { url }
    }, {
      upload: conn.waUploadToServer
    });
    return videoMessage;
  }

    // Buscar resultados en la API
    let { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    let searchResults = data.data;

    if (!searchResults || searchResults.length === 0) {
      return conn.reply(message.chat, "⚠︎ No se encontraron resultados para tu búsqueda.", message);
    }

    shuffleArray(searchResults);
    let topResults = searchResults.slice(0, 7); // Seleccionamos los 7 primeros

    // Crear las tarjetas del carrusel
    let cards = [];
    for (let result of topResults) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "Bot TikTok" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: result.title || "Video sin título",
          hasMediaAttachment: true,
          videoMessage: await createVideoMessage(result.nowm)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    // Enviar mensaje
    await conn.relayMessage(message.chat, messageContent.message, {
      messageId: messageContent.key.id
    });

  } catch (error) {
    console.error(error);
    conn.reply(message.chat, `⚠︎ *OCURRIÓ UN ERROR:* ${error.message}`, message);
  }
};

// Comandos relacionados
handler.help = ["tiktoksearch <texto>"];
handler.tags = ["buscador"];
handler.command = ["tiktoksearch", "ttss", "tiktoks"];

export default handler;
