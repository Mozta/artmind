import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
import { generateImage } from '../services/api';
// import { generateImage } from '../services/apiCova';
import { AsciiTitle } from './AsciiTitle';

export const RetroImageGenerator = () => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [image, setImage] = useState("");
    const [revisedPrompt, setRevisedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const recognitionRef = useRef(null);

    // Nuevo transcript final
    let finalTranscriptRef = useRef('');
    let timeoutRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true; // Mostrar resultados en tiempo real

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';

                // Recorre los resultados
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        // Si es final, almacena en el transcript final
                        finalTranscriptRef.current += transcript;

                        // Configura un temporizador para reiniciar el transcript si el usuario ha dejado de hablar
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = setTimeout(() => {
                            setTranscript(''); // Limpia el transcript en la interfaz
                            finalTranscriptRef.current = ''; // Reinicia el transcript final
                        }, 2000); // 2 segundos después de que el usuario deja de hablar

                    } else {
                        // Muestra los resultados intermedios en tiempo real
                        interimTranscript += transcript;
                    }
                }

                // Actualiza el estado para mostrar el texto en tiempo real
                setTranscript(finalTranscriptRef.current + interimTranscript);

                // Si el comando para generar la imagen es detectado, genera la imagen
                if (finalTranscriptRef.current.toLowerCase().includes('genera una imagen')) {
                    const prompt = finalTranscriptRef.current.replace('genera una imagen', '').trim();
                    handleImageGeneration(prompt);
                    finalTranscriptRef.current = ''; // Reinicia después de generar la imagen
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
            };
        } else {
            console.log('Speech recognition not supported');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearTimeout(timeoutRef.current); // Limpia el temporizador al desmontar el componente
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const handleImageGeneration = async (prompt) => {
        setIsGenerating(true);
        setImage("");
        try {
            const { imageUrl, revisedPrompt } = await generateImage(prompt);
            setImage(imageUrl);
            setRevisedPrompt(revisedPrompt);
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGenerating(false);
            setRevisedPrompt('');
        }
    };


    return (
        <div className="flex flex-col h-screen bg-black text-green-500 p-4 font-mono">
            <div className="flex-1 overflow-auto mb-4">
                <AsciiTitle />

                <p>{'> Speech recognition ' + (isListening ? 'active' : 'inactive')}</p>
                {isListening && (
                    <div className="flex items-center mb-4">
                        <div className="bg-red-600 rounded-full w-3 h-3 mr-2 animate-pulse"></div>
                        <span className="text-red-600 font-semibold">{('live')}</span>
                    </div>
                )}
                <p>{'> Di el comando: genera una imagen...'}</p>
                {transcript && <p>{'> ' + transcript}</p>}

                {isGenerating && (
                    <p>{'> ' + 'Generando imagen...'}</p>
                )}

                {revisedPrompt && (
                    <p className="text-xs bg-green-900 p-2 rounded">
                        {'> ' + revisedPrompt}
                    </p>
                )}

            </div>
            <div className="flex flex-col items-center justify-center mb-4">
                {isGenerating ? (
                    <>
                        <div className="flex-1 overflow-auto mb-4">
                            {<p>{'> ' + 'Generando imagen...'}</p>}
                        </div>
                        <div className="flex items-center justify-center border border-green-500 h-64 w-64">
                            <Loader2 className="h-12 w-12 animate-spin" />
                        </div>
                    </>
                ) : image ? (
                    <div className="flex flex-col items-center">
                        <img src={image} alt="Generated image" className="w-64 h-64 object-cover mb-4" />
                        <div className="flex items-center bg-green-900 p-2 rounded">
                            <Download className="mr-2" size={16} />
                            <span className="text-xs break-all">{image}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center border border-green-500 h-64 w-64">
                        <p>Image will appear here</p>
                    </div>
                )}
            </div>
            <button
                onClick={toggleListening}
                className={`${isListening ? 'bg-red-500' : 'bg-green-500'} text-black px-4 py-2 rounded transition-all duration-300`}
            >
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>

        </div>
    );
};