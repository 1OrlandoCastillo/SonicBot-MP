import fs from 'fs';

const filePath = './database/personalize.json';

// Datos predeterminados que se agregarán al archivo si no existe
const defaultData = {
    default: {
        botname: "Alya Mikhailovna Kujou",
    },
    global: {
        botname: null,
    }
};

let handler = async () => {
    try {
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            // Crear el archivo con la estructura predeterminada
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            console.log('✅ Archivo personalize.json creado exitosamente.');
        } else {
            // Validar la integridad del archivo existente
            const currentData = JSON.parse(fs.readFileSync(filePath));
            if (!currentData.default || !currentData.global) {
                console.log('⚠️ Archivo personalize.json incompleto. Se restablecerán los valores predeterminados.');
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            }
        }
    } catch (error) {
        console.error(`❌ Error al verificar o crear el archivo personalize.json: ${error.message}`);
    }
};

// Ejecución automática
handler();

export default handler;