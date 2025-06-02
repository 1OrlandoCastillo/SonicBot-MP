let partidas = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let id = m.sender
    const palabras = ['manzana', 'murciélago', 'camioneta', 'avion', 'perro', 'jirafa', 'programa', 'escuela']
    const maxIntentos = 6

    // Comienza una nueva partida
    if (command === 'ahorcado') {
        if (partidas[id]) {
            return conn.reply(m.chat, '[ ✰ ] Ya tienes una partida en curso. Usa *resolver <letra|palabra>* para continuar.', m)
        }

        let palabra = palabras[Math.floor(Math.random() * palabras.length)]
        partidas[id] = {
            palabra,
            progreso: Array(palabra.length).fill('_'),
            intentos: maxIntentos,
            letrasUsadas: [],
            finalizado: false
        }

        return conn.reply(m.chat, `🎮 Juego de Ahorcados iniciado 🎮\n\n${partidas[id].progreso.join(' ')}\n\nTienes ${maxIntentos} intentos. Escribe *${usedPrefix}resolver <letra|palabra>* para jugar.`, m)
    }

    // Resolver una letra o palabra
    if (command === 'resolver') {
        if (!partidas[id]) {
            return conn.reply(m.chat, '[ ✰ ] No tienes una partida activa. Usa *ahorcado* para comenzar una nueva.', m)
        }

        let partida = partidas[id]
        if (partida.finalizado) {
            delete partidas[id]
            return conn.reply(m.chat, '[ ✰ ] Esta partida ya terminó. Usa *ahorcado* para comenzar otra.', m)
        }

        let intento = args[0]?.toLowerCase()
        if (!intento) return conn.reply(m.chat, '[ ✰ ] Ingresa una letra o una palabra completa para resolver.', m)

        // Intento completo
        if (intento.length > 1) {
            if (intento === partida.palabra) {
                partida.progreso = partida.palabra.split('')
                partida.finalizado = true
                return conn.reply(m.chat, `🎉 ¡Correcto! Has adivinado la palabra: *${partida.palabra}*`, m)
            } else {
                partida.intentos--
                if (partida.intentos <= 0) {
                    partida.finalizado = true
                    return conn.reply(m.chat, `💀 ¡Has perdido! La palabra era: *${partida.palabra}*`, m)
                } else {
                    return conn.reply(m.chat, `❌ Palabra incorrecta. Te quedan *${partida.intentos}* intentos.`, m)
                }
            }
        }

        // Intento de letra
        if (partida.letrasUsadas.includes(intento)) {
            return conn.reply(m.chat, `🔁 Ya intentaste con la letra *${intento}*.`, m)
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
                return conn.reply(m.chat, `🎉 ¡Ganaste! La palabra era: *${partida.palabra}*`, m)
            }

            return conn.reply(m.chat, `✅ Letra correcta!\n\n${partida.progreso.join(' ')}\n\nLetras usadas: ${partida.letrasUsadas.join(', ')}\nIntentos restantes: ${partida.intentos}`, m)
        } else {
            partida.intentos--
            if (partida.intentos <= 0) {
                partida.finalizado = true
                return conn.reply(m.chat, `💀 ¡Perdiste! La palabra era: *${partida.palabra}*`, m)
            }

            return conn.reply(m.chat, `❌ Letra incorrecta. Te quedan *${partida.intentos}* intentos.\n\n${partida.progreso.join(' ')}\nLetras usadas: ${partida.letrasUsadas.join(', ')}`, m)
        }
    }
}

handler.help = ['ahorcado', 'resolver <letra|palabra>']
handler.tags = ['game']
handler.command = ['ahorcado', 'resolver']

export default handler