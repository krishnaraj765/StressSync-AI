import { useState } from 'react';

const useVoiceAssistant = (actions) => {
    const [isListening, setIsListening] = useState(false);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice features. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log("Detected Voice Command:", command);

            // --- 1. Variations for "Check Stress Level" (Triggers reading last result) ---
            const stressCommands = [
                "check my stress", "new test", 
                "show stress form", "analyze my stress", "how stressed am i", 
                "measure stress", "stress level check", "what is my stress level"
            ];

            // --- 2. Variations for "Show History" ---
            const historyCommands = [
                "show my history", "view trends", "check previous records", 
                "show my progress", "past data", "health history", 
                "show the chart", "display my records"
            ];

            // --- 3. Variations for "Give Recommendations" ---
            const recommendationCommands = [
                "give recommendations", "help me", "what should i do", 
                "give me advice", "how to reduce stress", "suggest something", 
                "tips for stress", "show my summary"
            ];

            // Logic to match the command against the arrays
            if (stressCommands.some(phrase => command.includes(phrase))) {
                // CHANGED: Now calls readLastResult to speak the most recent data
                actions.readLastResult(); 
            } 
            else if (historyCommands.some(phrase => command.includes(phrase))) {
                speak("Fetching your health history and trends.");
                actions.setView('history');
            } 
            else if (recommendationCommands.some(phrase => command.includes(phrase))) {
                // This triggers the recommendation logic in App.js
                actions.readRecommendations();
            } 
            else {
                speak("I'm sorry, I didn't recognize that command. Try asking, check my stress, or show my history or give recommendations.");
            }
        };

        recognition.start();
    };

    return { isListening, startListening, speak };
};

export default useVoiceAssistant;