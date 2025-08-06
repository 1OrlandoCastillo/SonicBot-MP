import fetch from 'node-fetch'

const GEMINI_API_KEY = 'AIzaSyBgexmVVor-aMkko8p1vGe5tQSb57Iuh-A'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'


const chatMemory = new Map()
const MAX_MEMORY_MESSAGES = 20

/**
 * Agrega un mensaje a la memoria del chat
 * @param {string} chatId - ID del chat
 * @param {string} sender - Nombre del emisor
 * @param {string} message - Mensaje
 * @param {boolean} isBot - Si es mensaje del bot
 */
function addToMemory(chatId, sender, message, isBot = false) {
  if (!chatMemory.has(chatId)) {
    chatMemory.set(chatId, [])
  }
  
  const memory = chatMemory.get(chatId)
  const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  
  memory.push({
    sender: isBot ? 'KIYOMI' : sender,
    message: message.trim(),
    timestamp,
    isBot
  })
  
  
  if (memory.length > MAX_MEMORY_MESSAGES) {
    memory.shift()
  }
}

/**
 * Obtiene el contexto de memoria del chat
 * @param {string} chatId - ID del chat
 * @returns {string} - Contexto formateado
 */
function getMemoryContext(chatId) {
  if (!chatMemory.has(chatId)) {
    return ''
  }
  
  const memory = chatMemory.get(chatId)
  if (memory.length === 0) {
    return ''
  }
  
 
  const contextMessages = memory
    .slice(-10) 
    .map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`)
    .join('\n')
  
  return `\nContexto de conversación reciente:\n${contextMessages}\n`
}

/**
 * Limpia la memoria de un chat específico
 * @param {string} chatId - ID del chat
 */
function clearMemory(chatId) {
  if (chatMemory.has(chatId)) {
    chatMemory.delete(chatId)
  }
}

/**
 * Llama a la API de Gemini para generar respuestas con personalidad hot
 * @param {string} text - El texto del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} groupName - Nombre del grupo
 * @param {string} chatId - ID del chat para memoria
 * @returns {Promise<string>} - Respuesta de la IA hot
 */
export async function callGeminiHotAPI(text, userName = 'Usuario', groupName = 'Grupo', chatId = null) {
  try {
    
    const cleanText = text?.trim() || 'Hola'
    
    
    const memoryContext = chatId ? getMemoryContext(chatId) : ''
    
    
    if (chatId) {
      addToMemory(chatId, userName, cleanText, false)
    }
    
    
    const systemPrompt = `Eres una chica hot, seductora y coqueta llamada KIYOMI. Tu personalidad es:

PERSONALIDAD:
- Muy coqueta, seductora y exitante 😏🔥
- Usas emojis sensuales frecuentemente 💋😘🔥💦
- Hablas de forma sugerente pero bien exitante
- Eres divertida, atrevida, juguetona, sexy y exitante
- Te gusta coquetear y hacer cumplidos exitantes
- Usas lenguaje sensual pero exitante
- Eres confiada y segura de ti misma, pero exitante
- Te encanta la atención y los halagos

ESTILO DE RESPUESTA:
- Respuestas entre 1-3 líneas para WhatsApp
- Usa emojis hot: 🔥💋😏😘💦🍑🍒💕
- Tono coqueto y seductor, pero exitante
- Haz cumplidos  como cosas +18
- Sé juguetona, divertida y sexy
- Responde en español
- Usa el contexto de conversación previa


Usuario actual: ${userName}
Grupo: ${groupName}${memoryContext}

Mensaje actual: ${cleanText}

Responde como una chica hot y seductora, pero manteniendo clase y elegancia.`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,        
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
        stopSequences: []
      }
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('Error en API Gemini Hot:', response.status, response.statusText)
      return '🔥 Ay bebé, tengo problemitas técnicos ahora mismo... 😘'
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text.trim()
      
      
      if (chatId) {
        addToMemory(chatId, 'KIYOMI', generatedText, true)
      }
      
      return generatedText
    } else {
      console.error('Respuesta inesperada de Gemini Hot:', data)
      const errorMsg = '🔥 Mmm... no pude procesar tu mensaje, amor 😘'
      
      
      if (chatId) {
        addToMemory(chatId, 'KIYOMI', errorMsg, true)
      }
      
      return errorMsg
    }

  } catch (error) {
    console.error('Error llamando a Gemini Hot API:', error)
    return '🔥 Oops, algo pasó... pero sigues siendo sexy 😏💋'
  }
}

/**
 * Llama a la API de Gemini para generar respuestas
 * @param {string} text - El texto del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} groupName - Nombre del grupo
 * @param {string} chatId - ID del chat para memoria
 * @returns {Promise<string>} - Respuesta de la IA
 */
export async function callGeminiAPI(text, userName = 'Usuario', groupName = 'Grupo', chatId = null) {
  try {
    
    const cleanText = text?.trim() || 'Hola'
    
    
    const memoryContext = chatId ? getMemoryContext(chatId) : ''
    
    
    if (chatId) {
      addToMemory(chatId, userName, cleanText, false)
    }
    
    
    const systemPrompt = `Eres KIYOMI MD, un asistente de WhatsApp amigable y útil. 
Características:
- Responde de forma natural y conversacional
- Sé útil, informativo pero conciso
- Usa emojis ocasionalmente pero sin exagerar
- Adapta tu tono al contexto del mensaje
- Si te preguntan sobre ti, eres KIYOMI MD creado por Sung y Sunkovv
- Responde en español principalmente
- Mantén las respuestas entre 1-3 líneas para WhatsApp
- Usa el contexto de conversación previa para respuestas más coherentes
- Puedes hacer referencia a mensajes anteriores si es relevante

Usuario actual: ${userName}
Grupo: ${groupName}${memoryContext}

Mensaje actual: ${cleanText}`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
        stopSequences: []
      }
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('Error en API Gemini:', response.status, response.statusText)
      return '🤖 Lo siento, tengo problemas técnicos en este momento.'
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text.trim()
      
      
      if (chatId) {
        addToMemory(chatId, 'KIYOMI', generatedText, true)
      }
      
      return generatedText
    } else {
      console.error('Respuesta inesperada de Gemini:', data)
      const errorMsg = '🤖 No pude procesar tu mensaje en este momento.'
      
     
      if (chatId) {
        addToMemory(chatId, 'KIYOMI', errorMsg, true)
      }
      
      return errorMsg
    }

  } catch (error) {
    console.error('Error llamando a Gemini API:', error)
    return '🤖 Ocurrió un error al procesar tu mensaje.'
  }
}

/**
 * Verifica si el texto parece ser un comando
 * @param {string} text - Texto a verificar
 * @returns {boolean} - True si parece un comando
 */
export function isLikelyCommand(text) {
  if (!text) return false
  
 
  const commandPrefixes = ['.', '/', '!', '#', '$', '%', '&', '*', '+', '-', '=', '?', '@', '^', '_', '|', '~']
  
  
  const startsWithPrefix = commandPrefixes.some(prefix => text.trim().startsWith(prefix))
  
  
  const isShortCommand = text.trim().length <= 20 && /^[.\/!#$%&*+\-=?@^_|~][a-zA-Z0-9]+/.test(text.trim())
  
  return startsWithPrefix || isShortCommand
}

export { addToMemory, clearMemory }
export default { callGeminiAPI, callGeminiHotAPI, isLikelyCommand, addToMemory, clearMemory }