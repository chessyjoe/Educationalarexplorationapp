import { useState } from 'react';
import { Camera, Focus, Loader2, Home, MessageCircle, Mic, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { PipMascot } from './PipMascot';
import { Button } from './ui/button';

type CameraMode = 'camera' | 'chat' | 'voice' | 'live';

interface CameraInterfaceProps {
  onCapture: () => void;
  isProcessing: boolean;
  onBack?: () => void;
  onOpenChat?: () => void;
  onOpenVoiceMode?: () => void;
  onOpenLiveDiscovery?: () => void;
}

export function CameraInterface({
  onCapture,
  isProcessing,
  onBack,
  onOpenChat,
  onOpenVoiceMode,
  onOpenLiveDiscovery
}: CameraInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<CameraMode>('camera');
  const [pipMessage, setPipMessage] = useState("Point me at something cool!");
  const [showReticle, setShowReticle] = useState(true);

  const messages = [
    "What did you find?",
    "Get a bit closer!",
    "Hold steady...",
    "Perfect! Now tap to snap!",
    "Ooh, what's that?",
    "I'm ready when you are!"
  ];

  const handleFocus = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setPipMessage(randomMessage);
  };

  const handleModeChange = (mode: CameraMode) => {
    if (mode === 'chat' && onOpenChat) {
      onOpenChat();
    } else if (mode === 'voice' && onOpenVoiceMode) {
      onOpenVoiceMode();
    } else if (mode === 'live' && onOpenLiveDiscovery) {
      onOpenLiveDiscovery();
    } else {
      setCurrentMode(mode);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-200 to-green-100 overflow-hidden">
      {/* Mode Switcher Tabs */}
      <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-2 px-4">
        <motion.button
          onClick={() => handleModeChange('camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[1rem] transition-all ${
            currentMode === 'camera'
              ? 'bg-white shadow-lg scale-105'
              : 'bg-white/70 hover:bg-white/85'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-semibold text-gray-800">Camera</span>
        </motion.button>

        <motion.button
          onClick={() => handleModeChange('chat')}
          className="flex items-center gap-2 px-4 py-2 rounded-[1rem] bg-white/70 hover:bg-white/85 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-5 h-5 text-pink-600" />
          <span className="text-sm font-semibold text-gray-800">Chat</span>
        </motion.button>

        <motion.button
          onClick={() => handleModeChange('voice')}
          className="flex items-center gap-2 px-4 py-2 rounded-[1rem] bg-white/70 hover:bg-white/85 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          <Mic className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Voice</span>
        </motion.button>

        <motion.button
          onClick={() => handleModeChange('live')}
          className="flex items-center gap-2 px-4 py-2 rounded-[1rem] bg-white/70 hover:bg-white/85 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-semibold text-gray-800">Live</span>
        </motion.button>
      </div>
      {/* Simulated camera view */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-600 opacity-50">
          <Camera className="w-24 h-24 mx-auto mb-2" />
          <p className="text-sm">Camera Preview</p>
          <p className="text-xs mt-1">(Simulated for demo)</p>
        </div>
      </div>

      {/* Target Reticle */}
      {showReticle && !isProcessing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-48 h-48">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg" />
            
            {/* Center focus dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Focus className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 text-white mx-auto" />
            </motion.div>
            <div className="mt-4">
              <PipMascot message="Analyzing with my magic dust! ✨" emotion="thinking" size="small" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Pip at top */}
      {!isProcessing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <PipMascot message={pipMessage} emotion="happy" size="small" />
        </div>
      )}

      {/* Capture button */}
      {!isProcessing && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={onCapture}
            className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 shadow-2xl border-4 border-blue-500"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          </Button>
          <p className="text-white text-sm font-medium drop-shadow-lg">Tap to Snap!</p>
        </div>
      )}

      {/* Helper hint */}
      {!isProcessing && (
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Point at plants or animals
        </motion.div>
      )}

      {/* Back button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            size="sm"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 shadow-2xl border-4 border-blue-500"
          >
            <Home className="w-6 h-6 text-blue-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
