import { motion } from 'motion/react';
import { AlertTriangle, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';
import type { Discovery } from '@/app/types';

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
      <div className="h-screen bg-gradient-to-b from-red-500 to-orange-400 flex flex-col overflow-hidden">
        {/* Compact header section with warning */}
        <div className="flex-shrink-0 flex items-center justify-between p-2 px-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center flex-1"
          >
            <h1 className="text-2xl font-bold text-white mb-1">STOP!</h1>
            <h2 className="text-lg font-bold text-white">Do Not Touch!</h2>
          </motion.div>

          <PipMascot message="Danger!" emotion="warning" size="small" />
        </div>

        {/* Main scrollable content area - MAXIMIZED */}
        <div className="flex-1 overflow-hidden flex flex-col px-3">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_0_rgba(0,0,0,0.12),0_15px_30px_rgba(0,0,0,0.15)] flex-1 overflow-y-auto">
            <h3 className="text-4xl font-bold text-red-600 mb-3">{discovery.name}</h3>
            {discovery.scientificName && (
              <p className="text-base text-gray-500 italic mb-6">{discovery.scientificName}</p>
            )}

            {/* Captured image area */}
            <div className="mb-6 rounded-[1.5rem] overflow-hidden bg-gray-100">
              {discovery.capturedImage ? (
                <img
                  src={discovery.capturedImage}
                  alt={discovery.name}
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400">
                  <p>Camera image not available</p>
                </div>
              )}
            </div>

            {/* Warning/Story section */}
            <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] p-6 mb-6">
              <p className="text-lg leading-relaxed text-gray-800">{discovery.story}</p>
            </div>

            {/* Fun Fact section */}
            {discovery.funFact && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[1.5rem] p-6 flex gap-4">
                <Sparkles className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-yellow-800 mb-2 text-lg">Important!</p>
                  <p className="text-base leading-relaxed text-gray-800">{discovery.funFact}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact bottom buttons area */}
        <div className="flex-shrink-0 px-3 py-3 bg-gradient-to-t from-orange-400 to-transparent flex gap-2">
          <Button
            onClick={handleSpeak}
            variant="outline"
            size="lg"
            className="flex-1 bg-white/90 hover:bg-white text-base h-12"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Read to Me
          </Button>
          <Button
            onClick={onTryAgain}
            size="lg"
            className="flex-1 bg-white text-red-600 hover:bg-gray-100 text-base h-12"
          >
            Find Something Else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-green-400 to-blue-500 flex flex-col overflow-hidden">
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

      {/* Compact header section */}
      <div className="flex-shrink-0 flex items-center justify-between p-2 px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex-1"
        >
          <h1 className="text-2xl font-bold text-white drop-shadow-lg text-center">
            🎉 Amazing Discovery! 🎉
          </h1>
        </motion.div>
        <PipMascot message="Awesome!" emotion="excited" size="small" />
      </div>

      {/* Main scrollable content area - MAXIMIZED */}
      <div className="flex-1 overflow-hidden flex flex-col px-3">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[2rem] p-8 shadow-[0_10px_0_rgba(0,0,0,0.12),0_15px_30px_rgba(0,0,0,0.15)] flex-1 overflow-y-auto"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">{discovery.name}</h2>
          {discovery.scientificName && (
            <p className="text-base text-gray-500 italic mb-6">{discovery.scientificName}</p>
          )}

          {/* Dynamic image area - responsive and larger */}
          <div className="mb-6 rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            <img
              src={discovery.capturedImage || discovery.imageUrl}
              alt={discovery.name}
              className="w-full max-h-96 object-cover"
            />
          </div>

          {/* Story section - larger text area */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] p-6 mb-6">
            <p className="text-lg leading-relaxed text-gray-800">{discovery.story}</p>
          </div>

          {/* Fun Fact section */}
          {discovery.funFact && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[1.5rem] p-6 mb-6 flex gap-4">
              <Sparkles className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-yellow-800 mb-2 text-lg">Fun Fact!</p>
                <p className="text-base leading-relaxed text-gray-800">{discovery.funFact}</p>
              </div>
            </div>
          )}

          {/* Try This section */}
          {discovery.followUpActivity && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-[1.5rem] p-6 flex gap-4">
              <span className="text-3xl">🎯</span>
              <div className="flex-1">
                <p className="font-bold text-purple-800 mb-2 text-lg">Try This!</p>
                <p className="text-base leading-relaxed text-gray-800">{discovery.followUpActivity}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Compact bottom buttons area */}
      <div className="flex-shrink-0 px-3 py-3 bg-gradient-to-t from-blue-500 to-transparent flex flex-col gap-2">
        <Button
          onClick={handleSpeak}
          variant="outline"
          size="lg"
          className="w-full bg-white/90 hover:bg-white text-base h-12"
        >
          <Volume2 className="w-5 h-5 mr-2" />
          Read to Me
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={onTryAgain}
            variant="outline"
            size="lg"
            className="flex-1 bg-white/90 hover:bg-white text-base h-12"
          >
            Find More
          </Button>
          <Button
            onClick={onAddToBoard}
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base h-12 shadow-lg"
          >
            Add to My Board! ✨
          </Button>
        </div>
      </div>
    </div>
  );
}
