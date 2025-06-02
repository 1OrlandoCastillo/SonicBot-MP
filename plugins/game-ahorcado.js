let partidas = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let id = m.sender
    const palabras = ['manzana', 'murciélago', 'camioneta', 'avion', 'perro', 'jirafa', 'programa', 'escuela']
    const maxIntentos = 6

    // Comienza una nueva partida
    if (command === 'ahorcado') {
        if (partidas[id]) {
            return conn.reply(m.chat, '✿ Ya tienes una partida en curso. Usa *.resolver <letra|palabra>* para continuar.', m, rcanal)
        }

        let palabra = palabras[Math.floor(Math.random() * palabras.length)]
        partidas[id] = {
            palabra,
            progreso: Array(palabra.length).fill('_'),
            intentos: maxIntentos,
            letrasUsadas: [],
            finalizado: false
        }

        return conn.reply(m.chat, `*✿ Hola, el juego ya a iniciado para jugar*\n\n• *Intentos →* ${maxIntentos}\n\n*Escribe .resolver <letra|palabra> para comenzar.* \n\n> *Ejemplo de uso → .resolver m*`, m, rcanal)
    }

    // Resolver una letra o palabra
    if (command === 'resolver') {
        if (!partidas[id]) {
            return conn.reply(m.chat, '✿ No tienes una partida activa. Usa *.ahorcado* para comenzar una nueva.', m, rcanal)
        }

        let partida = partidas[id]
        if (partida.finalizado) {
            delete partidas[id]
            return conn.reply(m.chat, '✿ Esta partida ya terminó. Usa *.ahorcado* para comenzar otra de nuevo.', m, rcanal)
        }

        let intento = args[0]?.toLowerCase()
        if (!intento) return conn.reply(m.chat, '✿ Escribe una *letra* o una *palabra* completa para resolver.', m, rcanal)

        // Intento completo
        if (intento.length > 1) {
            if (intento === partida.palabra) {
                partida.progreso = partida.palabra.split('')
                partida.finalizado = true
                return conn.reply(m.chat, `✿ ¡Correcto! Has adivinado la palabra: *${partida.palabra}*`, m, rcanal)
            } else {
                partida.intentos--
                if (partida.intentos <= 0) {
                    partida.finalizado = true
                    return conn.reply(m.chat, `✿ ¡Has perdido! La palabra era: *${partida.palabra}*`, m, rcanal)
                } else {
                    return conn.reply(m.chat, `✿ Palabra incorrecta. Te quedan *${partida.intentos}* intentos.`, m, rcanal)
                }
            }
        }

        // Intento de letra
        if (partida.letrasUsadas.includes(intento)) {
            return conn.reply(m.chat, `✿ Ya intentaste con la letra *${intento}*.`, m, rcanal)
        }

        partida.letrasUsadas.push(intento)

        if (partida.palabra.includes(intento)) {
            for (let i = 0; i < partida.palabra.length; i++) {
                if (partida.palabra[i] === intento) {
                    partida.progreso[i] = intento
                }
            }

            if (!partida.progreso.includes('_')) {
                partida.finalizado = true
                return conn.reply(m.chat, `✿ ¡Ganaste! La palabra era: *${partida.palabra}*`, m, rcanal)
            }

            return conn.reply(m.chat, `*✿ Hola, esta es una letra correcta*\n\n• *Intentos →* ${partida.intentos}\n\n*${partida.progreso.join(' ')}*\n\n> *Letras usadas → ${partida.letrasUsadas.join(', ')}*`, m, rcanal)
        } else {
            partida.intentos--
            if (partida.intentos <= 0) {
                partida.finalizado = true
                return conn.reply(m.chat, `✿ ¡Perdiste! La palabra era: *${partida.palabra}*`, m, rcanal)
            }

            return conn.reply(m.chat, `*✿ Hola, esta es un letra incorrecta*\n\n• *Intentos →* ${partida.intentos}\n\n*${partida.progreso.join(' ')}*\n> *Letras usadas → ${partida.letrasUsadas.join(', ')}*`, m, rcanal)
        }
    }
}

handler.help = ['ahorcado']
handler.tags = ['game']
handler.command = ['ahorcado', 'resolver']

export default handler
