import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, ArrowLeft, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';
import type { UserProfile } from '@/app/types';

interface VoiceModeProps {
  profile: UserProfile;
  onBack: () => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export function VoiceMode({ profile, onBack }: VoiceModeProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [pipMessage, setPipMessage] = useState(`Hi ${profile.name}! Tap the microphone and speak to me. I'm all ears! 👂`);
  const [pipEmotion, setPipEmotion] = useState<'happy' | 'excited' | 'thinking' | 'warning'>('happy');
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    // Note: This uses Web Speech API (works in Chrome, Edge, Safari)
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setPipMessage("Sorry, your browser doesn't support voice input. Try Chrome or Edge!");
      setPipEmotion('warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setVoiceState('listening');
      setPipMessage('I can hear you! Keep talking... 🎤');
      setPipEmotion('excited');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      setPipMessage(`Oops! I couldn't hear that. Try again! 🔊`);
      setPipEmotion('thinking');
      setVoiceState('idle');
    };

    recognition.onend = () => {
      setVoiceState('processing');
      setPipMessage('Let me think about that... 🤔');
      setPipEmotion('thinking');

      // Simulate processing
      setTimeout(() => {
        const responses = [
          `That's an amazing question! I love your curiosity! 🌟`,
          `You have such a great voice for discovery! Keep asking questions! 🎙️`,
          `Wow! Scientists ask lots of questions too. You're thinking like a real explorer! 🔬`,
          `I'm so impressed by your observations! Keep up the amazing work! 🏆`,
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setPipMessage(randomResponse);
        setPipEmotion('happy');

        // Auto-speak the response
        const utterance = new SpeechSynthesisUtterance(randomResponse);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);

        setVoiceState('speaking');

        // Return to idle after speaking
        setTimeout(() => {
          setVoiceState('idle');
          setPipMessage(`Ready to listen again! What's on your mind? 👂`);
          setPipEmotion('happy');
          setTranscript('');
        }, 2000);
      }, 2000);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-400 via-purple-400 to-pink-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Voice Mode</h1>
          <Volume2 className="w-6 h-6 text-blue-500" />
        </div>
        <p className="text-sm text-gray-600">Talk to Pip! She'll listen and respond to your voice.</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 space-y-8">
        {/* Pip Mascot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <PipMascot message={pipMessage} emotion={pipEmotion} size="large" />
        </motion.div>

        {/* Voice State Indicator */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {voiceState === 'listening' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-75"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.75, 0.2, 0.75]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}

          {voiceState === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="w-24 h-24 text-purple-500" />
            </motion.div>
          )}

          {voiceState === 'speaking' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-green-500 opacity-50"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-green-500 opacity-75"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.75, 0.2, 0.75]
                }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
              />
            </>
          )}

          {(voiceState === 'idle' || voiceState === 'listening') && (
            <motion.button
              onClick={voiceState === 'idle' ? startListening : stopListening}
              className={`
                w-32 h-32 rounded-full flex items-center justify-center shadow-2xl
                transition-all duration-200
                ${voiceState === 'listening'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={voiceState === 'listening' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6, repeat: voiceState === 'listening' ? Infinity : 0 }}
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </motion.button>
          )}

          {voiceState === 'processing' && (
            <motion.button
              disabled
              className="w-32 h-32 rounded-full flex items-center justify-center bg-purple-500 shadow-2xl"
            >
              <Loader className="w-16 h-16 text-white animate-spin" />
            </motion.button>
          )}

          {voiceState === 'speaking' && (
            <motion.button
              disabled
              className="w-32 h-32 rounded-full flex items-center justify-center bg-green-500 shadow-2xl"
            >
              <Volume2 className="w-16 h-16 text-white" />
            </motion.button>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.5rem] p-6 max-w-md shadow-lg"
          >
            <p className="text-sm text-gray-600 mb-2">You said:</p>
            <p className="text-lg text-gray-800 font-semibold italic">"{transcript}"</p>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white"
        >
          <p className="text-sm font-semibold drop-shadow-lg">
            {voiceState === 'idle' && 'Tap the microphone button to start talking!'}
            {voiceState === 'listening' && 'I\'m listening! Keep talking...'}
            {voiceState === 'processing' && 'Processing your question...'}
            {voiceState === 'speaking' && 'I\'m speaking to you!'}
          </p>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur p-4">
        <p className="text-xs text-gray-600 text-center">
          💡 Works best in Chrome, Edge, or Safari. Speak clearly and pause when done.
        </p>
      </div>
    </div>
  );
}
