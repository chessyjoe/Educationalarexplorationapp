import { useState, useRef, useEffect } from 'react';
import { Camera, Focus, Loader2, Settings, Zap, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { PipMascot } from './PipMascot';
import { Button } from './ui/button';
import { startCameraStream, stopCameraStream, captureFrame, getCameraPermissionStatus } from '../services/cameraService';
import { validateCapturedImage } from '../services/recognitionService';

interface CameraInterfaceProps {
  onCapture: (imageDataUrl: string) => void;
  isProcessing: boolean;
  onBack?: () => void;
}

export function CameraInterface({
  onCapture,
  isProcessing,
  onBack
}: CameraInterfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pipMessage, setPipMessage] = useState('Point at something to discover');
  const [pipEmotion, setPipEmotion] = useState<'happy' | 'excited' | 'thinking' | 'warning'>('happy');

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanupCamera();
    };
  }, []);

  // Switch camera when facing mode changes
  useEffect(() => {
    if (cameraStream) {
      cleanupCamera();
      setTimeout(() => initializeCamera(), 500);
    }
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      if (!videoRef.current) return;

      // Check permissions first
      const permStatus = await getCameraPermissionStatus();
      if (permStatus === 'denied') {
        setPermissionDenied(true);
        setPipMessage('Camera access denied. Please enable in settings.');
        setPipEmotion('warning');
        return;
      }

      setCameraError(null);
      setPipMessage('Opening camera...');
      setPipEmotion('thinking');

      const stream = await startCameraStream(videoRef.current, facingMode);
      setCameraStream(stream);
      
      setPipMessage('Ready to capture!');
      setPipEmotion('happy');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not access camera';
      setCameraError(message);
      setPipMessage('Camera not available');
      setPipEmotion('warning');
      
      if (message.includes('NotAllowedError') || message.includes('permission')) {
        setPermissionDenied(true);
      }
    }
  };

  const cleanupCamera = async () => {
    if (cameraStream) {
      await stopCameraStream(cameraStream);
      setCameraStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      setPipMessage('Capturing...');
      setPipEmotion('thinking');

      const imageDataUrl = captureFrame(videoRef.current);
      
      // Validate the captured image
      const validation = validateCapturedImage(imageDataUrl);
      if (!validation.valid) {
        setPipMessage(validation.error || 'Image not clear enough');
        setPipEmotion('warning');
        return;
      }

      setPipMessage('Got it! Analyzing...');
      setPipEmotion('excited');

      // Send to parent handler with actual image data
      onCapture(imageDataUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to capture';
      setCameraError(message);
      setPipMessage('Capture failed');
      setPipEmotion('warning');
    }
  };

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
    setPipMessage(flashEnabled ? 'Flash off' : 'Flash on');
    setPipEmotion('excited');
    setTimeout(() => setPipEmotion('happy'), 1500);
  };

  const handleCameraFlip = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    setPipMessage(facingMode === 'user' ? 'Back camera' : 'Front camera');
    setPipEmotion('excited');
    setTimeout(() => setPipEmotion('happy'), 1500);
  };

  if (permissionDenied) {
    return (
      <div className="relative w-full h-full bg-gradient-to-b from-[#8B6F5E] via-[#A88B73] to-[#8B6F5E] overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center z-20 px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-6"
          >
            📷
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">Camera Access Required</h2>
          <p className="text-white/80 mb-6 text-lg">
            Pocket Science needs camera access to identify objects. Please enable camera permissions in your browser settings.
          </p>
          <Button
            onClick={onBack}
            className="bg-white text-[#8B6F5E] hover:bg-gray-100 font-bold px-8 py-3 rounded-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Scrim overlay for better UI visibility */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Top Controls */}
      <div className="absolute top-6 left-0 right-0 z-20 px-6 flex items-center justify-between">
        {/* Flash button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleFlashToggle}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
            flashEnabled
              ? 'bg-white border-white text-black shadow-lg'
              : 'bg-transparent border-white/60 text-white hover:border-white/80'
          }`}
        >
          <Zap className="w-6 h-6" fill={flashEnabled ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Settings/Back button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-transparent border-2 border-white/60 text-white flex items-center justify-center transition-all hover:border-white/80"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Center Viewfinder */}
      {!isProcessing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            {/* Outer dashed circle */}
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

            {/* Inner circle */}
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

            {/* Center dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FF9B7A] shadow-lg"
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

      {/* Pip Mascot - bottom left */}
      {!isProcessing && (
        <div className="absolute bottom-40 left-6 z-10 flex items-end gap-3">
          <motion.div
            className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-4 border-white flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: pipEmotion === 'excited' ? [0, -3, 3, 0] : 0
            }}
            transition={{
              duration: pipEmotion === 'excited' ? 0.6 : 2,
              repeat: Infinity
            }}
          >
            <div className="text-2xl">
              {pipEmotion === 'excited' ? '😄' : pipEmotion === 'thinking' ? '🤔' : pipEmotion === 'warning' ? '⚠️' : '😊'}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl rounded-bl-none px-5 py-3 shadow-lg max-w-[200px] sm:max-w-[240px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            key={pipMessage}
          >
            <p className="text-gray-900 font-semibold text-sm leading-tight break-words">
              {pipMessage}
            </p>
          </motion.div>
        </div>
      )}

      {/* Bottom Controls */}
      {!isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 flex flex-col items-center">
          {/* Main capture button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleCapture}
            className="relative w-24 h-24 flex items-center justify-center flex-shrink-0 mb-8"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white" />
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FF9B7A] to-[#FFA88A] border-4 border-white" />
            {/* Inner content */}
            <div className="absolute inset-4 rounded-full border-2 border-white/40 flex items-center justify-center">
              <Focus className="w-7 h-7 text-white" />
            </div>
          </motion.button>

          {/* Camera flip button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleCameraFlip}
            className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 text-white flex items-center justify-center transition-all hover:border-white/60"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>

          {/* Home indicator */}
          <div className="flex justify-center mt-6">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}

      {/* Error message */}
      {cameraError && !permissionDenied && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-6 right-6 bg-red-500/90 text-white rounded-lg p-4 z-20"
        >
          <p className="font-semibold">{cameraError}</p>
        </motion.div>
      )}
    </div>
  );
}
