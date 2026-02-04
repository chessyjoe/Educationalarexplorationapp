import { motion } from 'motion/react';
import { AlertTriangle, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';
import type { Discovery } from '@/app/types';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ResultScreenProps {
  discovery: Discovery;
  onAddToBoard: () => void;
  onTryAgain: () => void;
}

export function ResultScreen({ discovery, onAddToBoard, onTryAgain }: ResultScreenProps) {
  const isDangerous = discovery.isDangerous;

  const handleSpeak = () => {
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(discovery.story);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isDangerous) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-500 to-orange-400 p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-6"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <AlertTriangle className="w-20 h-20 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2">STOP!</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Do Not Touch!</h2>
        </motion.div>

        <div className="mb-6">
          <PipMascot message="Careful! This one can hurt you!" emotion="warning" size="large" />
        </div>

        <div className="bg-white rounded-[2rem] p-6 max-w-md shadow-[0_10px_0_rgba(0,0,0,0.12),0_15px_30px_rgba(0,0,0,0.15)] mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-2">{discovery.name}</h3>
          {discovery.scientificName && (
            <p className="text-sm text-gray-500 italic mb-4">{discovery.scientificName}</p>
          )}

          <div className="mb-4 rounded-[1.5rem] overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={`https://source.unsplash.com/400x300/?${discovery.imageUrl}`}
              alt={discovery.name}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-4 mb-4">
            <p className="text-base leading-relaxed">{discovery.story}</p>
          </div>

          {discovery.funFact && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[1.5rem] p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <p className="text-sm leading-relaxed">{discovery.funFact}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSpeak}
            variant="outline"
            size="lg"
            className="bg-white/90 hover:bg-white"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Read to Me
          </Button>
          <Button
            onClick={onTryAgain}
            size="lg"
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Find Something Else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 p-6 flex flex-col">
      {/* Confetti celebration */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            initial={{ x: '50vw', y: -20, opacity: 1 }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              opacity: 0,
              rotate: 360
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: i * 0.1,
              ease: 'easeOut'
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center mb-4"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
          🎉 Amazing Discovery! 🎉
        </h1>
      </motion.div>

      <div className="mb-4">
        <PipMascot message="Wow! You found something awesome!" emotion="excited" size="medium" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2rem] p-6 shadow-[0_10px_0_rgba(0,0,0,0.12),0_15px_30px_rgba(0,0,0,0.15)] mb-6 flex-1 overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{discovery.name}</h2>
        {discovery.scientificName && (
          <p className="text-sm text-gray-500 italic mb-4">{discovery.scientificName}</p>
        )}

        <div className="mb-4 rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <ImageWithFallback
            src={`https://source.unsplash.com/400x300/?${discovery.imageUrl}`}
            alt={discovery.name}
            className="w-full h-56 object-cover"
          />
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] p-4 mb-4">
          <p className="text-base leading-relaxed">{discovery.story}</p>
        </div>

        {discovery.funFact && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[1.5rem] p-4 mb-4 flex gap-3">
            <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-yellow-800 mb-1">Fun Fact!</p>
              <p className="text-sm leading-relaxed">{discovery.funFact}</p>
            </div>
          </div>
        )}

        {discovery.followUpActivity && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-[1.5rem] p-4 flex gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-purple-800 mb-1">Try This!</p>
              <p className="text-sm leading-relaxed">{discovery.followUpActivity}</p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex gap-3 mb-4">
        <Button
          onClick={handleSpeak}
          variant="outline"
          size="lg"
          className="flex-1 bg-white/90 hover:bg-white text-lg h-14"
        >
          <Volume2 className="w-6 h-6 mr-2" />
          Read to Me
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onTryAgain}
          variant="outline"
          size="lg"
          className="flex-1 bg-white/90 hover:bg-white text-lg h-14"
        >
          Find More
        </Button>
        <Button
          onClick={onAddToBoard}
          size="lg"
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg h-14 shadow-lg"
        >
          Add to My Board! ✨
        </Button>
      </div>
    </div>
  );
}
