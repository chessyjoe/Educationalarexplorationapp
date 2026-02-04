import { useState } from 'react';
import { Camera, Focus, Loader2, Settings, Zap, RotateCcw, Image, Film, Leaf } from 'lucide-react';
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
  const [pipMessage, setPipMessage] = useState("That looks like a Fern! Keep it in the circle.");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const messages = [
    "That looks like a Fern! Keep it in the circle.",
    "What did you find?",
    "Get a bit closer!",
    "Hold steady...",
    "Perfect! Now tap to snap!",
    "Ooh, what's that?",
    "I'm ready when you are!"
  ];

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

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
  };

  const handleCameraFlip = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const handleGallery = () => {
    // Open gallery
    console.log('Open gallery');
  };

  const handleRecent = () => {
    // Open recent captures
    console.log('Open recent captures');
  };

  const handlePhotoMode = () => {
    // Switch to photo mode
    console.log('Photo mode');
  };

  const handleDiscoveryMode = () => {
    if (onOpenLiveDiscovery) {
      onOpenLiveDiscovery();
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#8B6F5E] via-[#A88B73] to-[#8B6F5E] overflow-hidden">
      {/* Simulated camera view */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="text-center text-white">
          <Camera className="w-24 h-24 mx-auto mb-2" />
          <p className="text-sm">Camera Preview</p>
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-6 left-0 right-0 z-20 px-6">
        <div className="flex items-center justify-between">
          {/* Flash button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFlashToggle}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors ${
              flashEnabled 
                ? 'bg-white border-white text-[#8B6F5E]' 
                : 'bg-transparent border-white/60 text-white'
            }`}
          >
            <Zap className="w-6 h-6" fill={flashEnabled ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Lens Mode button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FF9B7A] to-[#FFA88A] text-white font-bold text-sm tracking-wider shadow-lg"
          >
            LENS MODE
          </motion.button>

          {/* Settings button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-14 h-14 rounded-full bg-transparent border-2 border-white/60 text-white flex items-center justify-center"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Camera flip button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCameraFlip}
          className="w-14 h-14 rounded-full bg-transparent border-2 border-white/60 text-white flex items-center justify-center mt-4"
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Center viewfinder */}
      {!isProcessing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-80 h-80">
            {/* Outer dashed circle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <circle
                cx="160"
                cy="160"
                r="155"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity="0.6"
              />
            </svg>
            
            {/* Inner solid circle */}
            <div className="absolute inset-4 rounded-full border-4 border-white/80" />
            
            {/* Center dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FF9B7A]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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

      {/* Pip mascot with speech bubble - bottom left */}
      {!isProcessing && (
        <div className="absolute bottom-48 left-6 z-10 flex items-end gap-3">
          {/* Pip avatar */}
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-4 border-white flex items-center justify-center shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl">😊</div>
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            className="bg-white rounded-3xl rounded-bl-none px-5 py-3 shadow-lg max-w-[240px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-gray-900 font-semibold text-sm leading-tight">
              {pipMessage}
            </p>
          </motion.div>
        </div>
      )}

      {/* Bottom controls */}
      {!isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          {/* Swipe for modes text */}
          <div className="text-center mb-4">
            <p className="text-white text-xs font-semibold tracking-wider opacity-80">
              SWIPE FOR MODES
            </p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-8 px-6">
            {/* Gallery */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGallery}
              className="w-14 h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center"
            >
              <Image className="w-6 h-6" />
            </motion.button>

            {/* Recent captures */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRecent}
              className="w-14 h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center"
            >
              <Film className="w-5 h-5" />
            </motion.button>

            {/* Main capture button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCapture}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white" />
              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FF9B7A] to-[#FFA88A] border-4 border-white" />
              {/* Inner content */}
              <div className="absolute inset-4 rounded-full border-2 border-white/40 flex items-center justify-center">
                <Focus className="w-6 h-6 text-white" />
              </div>
            </motion.button>

            {/* Photo mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePhotoMode}
              className="w-14 h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center"
            >
              <Camera className="w-6 h-6" />
            </motion.button>

            {/* Discovery mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscoveryMode}
              className="w-14 h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center"
            >
              <Leaf className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Home indicator bar */}
          <div className="flex justify-center mt-6">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
