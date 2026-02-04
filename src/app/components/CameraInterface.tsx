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
      {/* Mode Switcher Tabs - Positioned below Pip mascot to avoid overlap */}
      <div className="absolute top-24 left-0 right-0 z-20 flex justify-center gap-2 px-4 flex-wrap">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant={currentMode === 'camera' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('camera')}
            className="flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 border-0"
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModeChange('chat')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white/95 text-gray-800 border-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModeChange('voice')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white/95 text-gray-800 border-0"
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleModeChange('live')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white/95 text-gray-800 border-0"
          >
            <Zap className="w-4 h-4" />
            <span>Live</span>
          </Button>
        </motion.div>
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
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={onCapture}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-[0_8px_0_rgba(0,0,0,0.2),0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_0_rgba(0,0,0,0.2),0_16px_32px_rgba(0,0,0,0.2)] active:shadow-[0_4px_0_rgba(0,0,0,0.15),0_6px_12px_rgba(0,0,0,0.1)] active:translate-y-1"
            >
              <Camera className="w-8 h-8" />
            </Button>
          </motion.div>
          <p className="text-white text-sm font-semibold drop-shadow-lg">Tap to Snap!</p>
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
        <motion.div className="absolute top-4 left-4 z-10" whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            onClick={onBack}
            variant="default"
            className="bg-white hover:bg-gray-100 text-blue-600 shadow-[0_4px_0_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_0_rgba(0,0,0,0.12),0_10px_20px_rgba(0,0,0,0.15)] active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.06)] active:translate-y-0.5"
          >
            <Home className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
