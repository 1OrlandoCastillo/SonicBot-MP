let adivinanzas = {
    'Tiene agujas pero no pincha.': 'reloj',
    'Tiene dientes pero no muerde.': 'peine',
    'Va por el agua y no se moja.': 'sombra',
    'Tiene patas pero no camina.': 'mesa',
    'Tiene hojas pero no es planta.': 'libro'
}

let partidasAdivinanza = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let id = m.sender
    const maxIntentos = 3

    if (command === 'adivinanza') {
        if (partidasAdivinanza[id]) {
            return conn.reply(m.chat, '✿ Ya tienes una partida en curso. Usa *.responder <respuesta>* para continuar.', m, rcanal)
        }

        let claves = Object.keys(adivinanzas)
        let pregunta = claves[Math.floor(Math.random() * claves.length)]
        let respuesta = adivinanzas[pregunta]

        partidasAdivinanza[id] = {
            pregunta,
            respuesta,
            intentos: maxIntentos,
            finalizado: false
        }

        return conn.reply(m.chat, `*✿ Hola, el juego ya a iniciado para jugar adivina esta*\n\n• *Intentos Totales →* ${maxIntentos}\n\n*${pregunta}*\n\n> *Responde con .responder <respuesta> para comenzar.*`, m, rcanal)
    }

    if (command === 'responder') {
        if (!partidasAdivinanza[id]) {
            return conn.reply(m.chat, '✿ No tienes una partida activa. Usa *.adivinanza* para comenzar una nueva.', m, rcanal)
        }

        let partida = partidasAdivinanza[id]
        if (partida.finalizado) {
            delete partidasAdivinanza[id]
            return conn.reply(m.chat, '✿ Esta partida ya terminó. Usa *.adivinanza* para jugar otra vez.', m, rcanal)
        }

        let intento = args.join(' ')?.toLowerCase().trim()
        if (!intento) return conn.reply(m.chat, '✿ Escribe una respuesta para intentar *adivinar.*', m, rcanal)

        if (intento === partida.respuesta.toLowerCase()) {
            partida.finalizado = true
            return conn.reply(m.chat, `✿ ¡Correcto! La respuesta era: *${partida.respuesta}*`, m, rcanal)
        } else {
            partida.intentos--
            if (partida.intentos <= 0) {
                partida.finalizado = true
                return conn.reply(m.chat, `✿ ¡Has perdido! La respuesta correcta era: *${partida.respuesta}*`, m, rcanal)
            } else {
                return conn.reply(m.chat, `*✿ Hola, esta es una respuesta incorrecta*\n\n• *Intentos Totales →* ${partida.intentos}\n\n> *Intentalo de nuevo con .responder <respuesta>.*`, m, rcanal)
            }
        }
    }
}

handler.help = ['adivinanza']
handler.tags = ['game']
handler.command = ['adivinanza', 'responder']

export default handler
