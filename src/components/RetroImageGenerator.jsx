import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
// import { generateImage } from '../services/api';
import { generateImage } from '../services/apiCova';
import { AsciiTitle } from './AsciiTitle';

export const RetroImageGenerator = () => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [image, setImage] = useState("");
    const [revisedPrompt, setRevisedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const recognitionRef = useRef(null);

    let finalTranscriptRef = useRef('');
    let timeoutRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += transcript;
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = setTimeout(() => {
                            setTranscript('');
                            finalTranscriptRef.current = '';
                        }, 2000);
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscriptRef.current + interimTranscript);

                if (finalTranscriptRef.current.toLowerCase().includes('genera una imagen')) {
                    const prompt = finalTranscriptRef.current.replace('genera una imagen', '').trim();
                    handleImageGeneration(prompt);
                    finalTranscriptRef.current = '';
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
            clearTimeout(timeoutRef.current);
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

    // Componente de Loading
    const LoadingAnimation = () => (
        <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="text-green-500 text-4xl font-mono"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                Generando tu imagen 🪄...
            </motion.div>
        </motion.div>
    );

    const handleImageGeneration = async (prompt) => {
        setIsGenerating(true);
        setImage("");
        try {
            const { imageUrl, revisedPrompt } = await generateImage(prompt);
            setImage(imageUrl);
            setRevisedPrompt(revisedPrompt);
            setIsModalOpen(true); // Abre el modal cuando la imagen esté lista
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGenerating(false);
            setRevisedPrompt('');
        }
    };

    // Función para cerrar el modal y continuar escuchando si es necesario
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Verificar si el reconocimiento de voz sigue activo, si es así, reiniciarlo
        if (isListening && recognitionRef.current) {
            recognitionRef.current.start(); // Reiniciar el reconocimiento si estaba activo
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

                {revisedPrompt && (
                    <p className="text-xs bg-green-900 p-2 rounded">
                        {'> ' + revisedPrompt}
                    </p>
                )}
            </div>

            {/* Animación de Loading */}
            <AnimatePresence>
                {isGenerating && <LoadingAnimation />}
            </AnimatePresence>

            {/* Modal para mostrar la imagen generada */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
                    >
                        <motion.div
                            className="bg-green-900 p-4 rounded-lg shadow-lg max-w-lg w-full border-2 border-green-500"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-lg font-bold mb-2 text-center text-green-500 font-mono">
                                Imagen Generada
                            </h2>
                            {image && (
                                <div className="p-2 border border-green-500 bg-black mb-4">
                                    <img src={image} alt="Generated" className="w-full h-auto object-cover rounded" />
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={toggleListening}
                className={`${isListening ? 'bg-red-500' : 'bg-green-500'} text-black mx-12 px-4 py-4 rounded transition-all duration-300`}
            >
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
        </div>
    );
};