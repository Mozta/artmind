import React, { useState } from 'react';
import { transcribeAudio, translateText, generateImage, multiModelProcess } from '../services/api';

export const Artmind = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);

    // Handler para cuando el usuario carga un archivo de audio
    const handleAudioChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    // Función para transcribir el audio
    const handleTranscribe = async () => {
        if (audioFile) {
            const text = await transcribeAudio(audioFile);
            setTranscript(text);
        }
    };

    // Función para traducir el texto
    const handleTranslate = async () => {
        if (transcript) {
            const translated = await translateText(transcript);
            setTranslatedText(translated);
        }
    };

    // Función para generar imagen
    const handleGenerateImage = async () => {
        if (translatedText) {
            const imageUrl = await generateImage(translatedText);
            setGeneratedImage(imageUrl);
        }
    };

    // Función para realizar todo el proceso
    const handleFullProcess = async () => {
        if (audioFile) {
            const imageUrl = await multiModelProcess(audioFile);
            setGeneratedImage(imageUrl);
        }
    };

    return (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 min-h-screen flex flex-col items-center justify-center p-5 text-white font-mono">
            <h1 className="text-4xl font-bold mb-8 neon-text text-shadow">🎨 ArtMind Retro 🎨</h1>

            <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="bg-blue-700 border border-yellow-500 text-white rounded-lg p-2 mb-4 cursor-pointer hover:bg-yellow-500 hover:text-blue-700 transition-all"
            />

            <div className="space-y-4">
                <button
                    onClick={handleTranscribe}
                    className="bg-blue-600 px-6 py-2 rounded-full border border-pink-400 hover:bg-pink-500 transition-all"
                >
                    Transcribir Audio
                </button>
                {transcript && (
                    <p className="bg-black text-green-300 p-4 rounded-lg border border-green-500">Transcripción: {transcript}</p>
                )}

                <button
                    onClick={handleTranslate}
                    className="bg-green-600 px-6 py-2 rounded-full border border-purple-400 hover:bg-purple-500 transition-all"
                >
                    Traducir Texto
                </button>
                {translatedText && (
                    <p className="bg-black text-yellow-300 p-4 rounded-lg border border-yellow-500">Texto Traducido: {translatedText}</p>
                )}

                <button
                    onClick={handleGenerateImage}
                    className="bg-red-600 px-6 py-2 rounded-full border border-blue-400 hover:bg-blue-500 transition-all"
                >
                    Generar Imagen
                </button>
                {generatedImage && (
                    <img
                        src={generatedImage}
                        alt="Imagen Generada"
                        className="border-4 border-yellow-400 mt-4"
                    />
                )}

                <button
                    onClick={handleFullProcess}
                    className="bg-purple-600 px-6 py-2 rounded-full border border-green-400 hover:bg-green-500 transition-all"
                >
                    Procesar Todo
                </button>
            </div>

            {generatedImage && (
                <img
                    src={generatedImage}
                    alt="Imagen Generada del Proceso Completo"
                    className="border-4 border-pink-400 mt-4"
                />
            )}
        </div>
    );
}
