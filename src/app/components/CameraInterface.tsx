import { useState, useRef } from 'react';
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
  const [pipEmotion, setPipEmotion] = useState<'happy' | 'excited' | 'thinking' | 'warning'>('happy');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      setPipMessage("Opening chat mode...");
      setPipEmotion('excited');
      onOpenChat();
    } else if (mode === 'voice' && onOpenVoiceMode) {
      setPipMessage("Time to talk!");
      setPipEmotion('excited');
      onOpenVoiceMode();
    } else if (mode === 'live' && onOpenLiveDiscovery) {
      setPipMessage("Let's find discoveries!");
      setPipEmotion('excited');
      onOpenLiveDiscovery();
    } else {
      setCurrentMode(mode);
      setPipMessage("Camera mode ready!");
      setPipEmotion('happy');
    }
  };

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
    setPipMessage(flashEnabled ? "Flash off!" : "Flash on!");
    setPipEmotion('excited');
    setTimeout(() => {
      setPipEmotion('happy');
    }, 1500);
  };

  const handleCameraFlip = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    setPipMessage(facingMode === 'user' ? "Back camera ready!" : "Front camera ready!");
    setPipEmotion('excited');
    setTimeout(() => {
      setPipEmotion('happy');
    }, 1500);
  };

  const handleGallery = () => {
    setPipMessage("Opening your gallery...");
    setPipEmotion('happy');
    console.log('Open gallery');
  };

  const handleRecent = () => {
    setPipMessage("Checking your recent captures...");
    setPipEmotion('happy');
    console.log('Open recent captures');
  };

  const handlePhotoMode = () => {
    setPipMessage("Photo mode activated!");
    setPipEmotion('excited');
    console.log('Photo mode');
  };

  const handleDiscoveryMode = () => {
    if (onOpenLiveDiscovery) {
      setPipMessage("Let's find discoveries!");
      setPipEmotion('excited');
      onOpenLiveDiscovery();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left - next mode
    if (diff > 50) {
      setPipMessage("Swiping to next mode...");
      setPipEmotion('excited');
    }
    // Swipe right - previous mode
    else if (diff < -50) {
      setPipMessage("Swiping to previous mode...");
      setPipEmotion('excited');
    }

    setTouchStart(null);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full bg-gradient-to-b from-[#8B6F5E] via-[#A88B73] to-[#8B6F5E] overflow-hidden"
    >
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

      {/* Center viewfinder - responsive & interactive */}
      {!isProcessing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
            {/* Outer dashed circle - responsive stroke */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet">
              {/* Scanning animation circle */}
              <motion.circle
                cx="160"
                cy="160"
                r="155"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity="0.4"
                animate={{
                  strokeDashoffset: [0, 32],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              {/* Static circle */}
              <circle
                cx="160"
                cy="160"
                r="155"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="8 8"
                opacity="0.5"
              />
            </svg>

            {/* Inner solid circle */}
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-white/80"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(255, 255, 255, 0.5)',
                  '0 0 0 8px rgba(255, 255, 255, 0.2)',
                  '0 0 0 0px rgba(255, 255, 255, 0.5)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Center dot - responsive size */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF9B7A] shadow-lg"
              animate={{
                scale: [1, 1.4, 1],
                boxShadow: [
                  '0 0 8px 2px rgba(255, 155, 122, 0.5)',
                  '0 0 16px 4px rgba(255, 155, 122, 0.8)',
                  '0 0 8px 2px rgba(255, 155, 122, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Corner focus indicators */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
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

      {/* Pip mascot with speech bubble - bottom left, responsive */}
      {!isProcessing && (
        <div className="absolute bottom-32 sm:bottom-40 left-4 sm:left-6 z-10 flex items-end gap-2 sm:gap-3">
          {/* Pip avatar */}
          <motion.div
            className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-4 border-white flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: pipEmotion === 'excited' ? [0, -3, 3, 0] : 0
            }}
            transition={{
              duration: pipEmotion === 'excited' ? 0.6 : 2,
              repeat: Infinity
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-xl sm:text-2xl">
              {pipEmotion === 'excited' ? '😄' : pipEmotion === 'thinking' ? '🤔' : '😊'}
            </div>
          </motion.div>

          {/* Speech bubble - responsive width and text */}
          <motion.div
            className="bg-white rounded-3xl rounded-bl-none px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg max-w-[200px] sm:max-w-[240px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            key={pipMessage}
          >
            <p className="text-gray-900 font-semibold text-xs sm:text-sm leading-tight break-words">
              {pipMessage}
            </p>
          </motion.div>
        </div>
      )}

      {/* Bottom controls - responsive layout */}
      {!isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-4 sm:pb-8">
          {/* Swipe for modes text */}
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-white text-xs font-semibold tracking-wider opacity-80">
              SWIPE FOR MODES
            </p>
          </div>

          {/* Control buttons - responsive grid/flex */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6">
            {/* Gallery */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGallery}
              title="Gallery"
              aria-label="Gallery"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center transition-all hover:border-white/50 active:bg-black/60"
            >
              <Image className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Recent captures */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRecent}
              title="Recent"
              aria-label="Recent captures"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center transition-all hover:border-white/50 active:bg-black/60"
            >
              <Film className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Main capture button - largest, centered */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={onCapture}
              title="Capture photo"
              aria-label="Capture photo"
              className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0"
            >
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white" />
              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FF9B7A] to-[#FFA88A] border-4 border-white" />
              {/* Inner content */}
              <div className="absolute inset-4 rounded-full border-2 border-white/40 flex items-center justify-center">
                <Focus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </motion.button>

            {/* Photo mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePhotoMode}
              title="Photo mode"
              aria-label="Photo mode"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center transition-all hover:border-white/50 active:bg-black/60"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* Discovery mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscoveryMode}
              title="Discovery mode"
              aria-label="Live discovery mode"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 border-2 border-white/30 text-white flex items-center justify-center transition-all hover:border-white/50 active:bg-black/60"
            >
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>

          {/* Home indicator bar */}
          <div className="flex justify-center mt-4 sm:mt-6">
            <div className="w-24 sm:w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
