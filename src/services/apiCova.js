import axios from 'axios';

const API_BASE_URL = 'https://api-artmind.onrender.com';

export const uploadAudio = async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await axios.post(`${API_BASE_URL}/audio-to-text`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.transcription;
    } catch (error) {
        console.error('Error uploading audio:', error);
        throw error;
    }
};

export const translateText = async (text) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/translate-text`, { text });
        return response.data.translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
};

export const generateImage = async (prompt) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/generate-image-with-logo`, { prompt });
        const { firebase_url, prompt } = response.data;
        console.log(firebase_url);
        return {
            imageUrl: firebase_url,
            revisedPrompt: prompt,
        };
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};