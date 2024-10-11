import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
import { generateImage } from '../services/api';
// import { generateImage } from '../services/apiCova';

export const RetroImageGenerator = () => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [image, setImage] = useState("");
    const [revisedPrompt, setRevisedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setTranscript(transcript);
                if (transcript.toLowerCase().includes('genera una imagen')) {
                    // remove the command from the transcript
                    const prompt = transcript.replace('genera una imagen', '').trim();
                    handleImageGeneration(prompt);
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
        }
    };


    return (
        <div className="flex flex-col h-screen bg-black text-green-500 p-4 font-mono">
            <div className="flex-1 overflow-auto mb-4">
                <p>{'> Speech recognition ' + (isListening ? 'active' : 'inactive')}</p>
                {transcript && <p>{'> ' + transcript}</p>}
            </div>
            <div className="flex flex-col items-center justify-center mb-4">
                {isGenerating ? (
                    <div className="flex items-center justify-center border border-green-500 h-64 w-64">
                        <Loader2 className="h-12 w-12 animate-spin" />
                    </div>
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
                className="bg-green-500 text-black px-4 py-2 rounded"
            >
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
        </div>
    );
};