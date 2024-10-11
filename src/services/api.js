// api.js
import axios from 'axios';

// Define la URL base de la API
const BASE_URL = 'https://artmind-api.onrender.com';  // Cambia esto a la URL de tu API si está en producción

// Servicio para transcribir audio a texto
export const transcribeAudio = async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await axios.post(`${BASE_URL}/speech-to-text`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.transcript;
    } catch (error) {
        console.error('Error transcribiendo el audio:', error);
        throw error;
    }
};

// Servicio para traducir texto
export const translateText = async (text) => {
    try {
        const response = await axios.post(`${BASE_URL}/translate`, { text });
        return response.data.translated_text;
    } catch (error) {
        console.error('Error traduciendo el texto:', error);
        throw error;
    }
};

// Servicio para generar una imagen
export const generateImage = async (prompt) => {
    try {
        const response = await axios.post(`${BASE_URL}/image-generator`, { prompt });

        // Extraer los dos campos de la respuesta
        const { image_url, revised_prompt } = response.data;

        // Devolver ambos campos en un objeto
        return {
            imageUrl: image_url,
            revisedPrompt: revised_prompt,
        };
    } catch (error) {
        console.error('Error generando la imagen:', error);
        throw error;
    }
};


// Servicio que ejecuta el flujo completo (transcripción, traducción, generación de imagen)
export const multiModelProcess = async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await axios.post(`${BASE_URL}/multi-model`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob', // Para recibir la imagen generada como blob
        });
        return URL.createObjectURL(response.data);  // Crea una URL que puedes usar en un elemento <img>
    } catch (error) {
        console.error('Error en el flujo completo del modelo:', error);
        throw error;
    }
};
