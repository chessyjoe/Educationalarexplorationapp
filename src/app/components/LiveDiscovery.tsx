import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowLeft, Pause, Play, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';
import type { UserProfile } from '@/app/types';
import { startCameraStream, stopCameraStream, captureFrame, getCameraPermissionStatus } from '../services/cameraService';
import { analyzeImage } from '../services/recognitionService';
import { statsAPI } from '@/services/apiService';

interface LiveDiscoveryProps {
  profile: UserProfile;
  onBack: () => void;
  onDiscovery: (count: number) => void;
  onSessionComplete?: (sessionDiscoveries: SessionDiscovery[]) => void;
}

interface LiveStat {
  label: string;
  value: number;
  icon: string;
}

interface SessionDiscovery {
  id: string;
  name: string;
  timestamp: Date;
  confidence: number;
  selected: boolean;
  imageUrl?: string;
}

const MAX_SESSION_DURATION = 5 * 60; // 5 minutes in seconds

export function LiveDiscovery({ profile: _profile, onBack, onDiscovery: _onDiscovery, onSessionComplete }: LiveDiscoveryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDiscoveries, setSessionDiscoveries] = useState<SessionDiscovery[]>([]);
  const [pipMessage, setPipMessage] = useState('Ready to discover? Let\'s go!');
  const [pipEmotion, setPipEmotion] = useState<'happy' | 'excited' | 'thinking' | 'warning'>('happy');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [stats, setStats] = useState<LiveStat[]>([
    { label: 'Discoveries Today', value: 0, icon: '🔍' },
    { label: 'New Species', value: 0, icon: '🆕' },
    { label: 'Streak', value: 7, icon: '🔥' }
  ]);

  useEffect(() => {
    initializeCamera(facingMode);
    fetchStats();
    return () => {
      cleanupCamera();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await statsAPI.get();
      setStats([
        { label: 'Discoveries Today', value: stats.discoveries_today, icon: '🔍' },
        { label: 'New Species', value: stats.new_species, icon: '🆕' },
        { label: 'Streak', value: stats.streak_days, icon: '🔥' }
      ]);
    } catch {
      // Leave defaults if stats unavailable (unauthenticated user)
    }
  };

  const initializeCamera = async (currentFacingMode: 'environment' | 'user') => {
    try {
      const permStatus = await getCameraPermissionStatus();
      if (permStatus === 'denied') {
        setPermissionDenied(true);
        setCameraError('Camera access denied');
        return;
      }

      if (videoRef.current) {
        const stream = await startCameraStream(videoRef.current, currentFacingMode);
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Camera init error:', error);
      setCameraError('Could not start camera');
    }
  };

  const toggleCamera = async () => {
    if (cameraStream) {
      await stopCameraStream(cameraStream);
      setCameraStream(null);
    }
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    await initializeCamera(newMode);
  }

  const cleanupCamera = async () => {
    if (cameraStream) {
      await stopCameraStream(cameraStream);
      setCameraStream(null);
    }
  };

  const toggleLiveMode = () => {
    if (!isRunning) {
      // Starting session
      setIsRunning(true);
      setDiscoveredCount(0);
      setSessionTime(0);
      setSessionDiscoveries([]);
      setPipMessage('Scanning for discoveries...');
      setPipEmotion('excited');
    } else {
      // Stopping session - show results preview
      setIsRunning(false);
      setPipMessage('Great job! Let\'s see what you found.');
      setPipEmotion('happy');
      if (onSessionComplete && sessionDiscoveries.length > 0) {
        onSessionComplete(sessionDiscoveries);
      }
    }
  };

  // Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSessionTime(t => {
          const newTime = t + 1;
          if (newTime >= MAX_SESSION_DURATION) {
            toggleLiveMode(); // Stop automatically
            return t;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const captureImage = async () => {
    if (isAnalyzing || !videoRef.current || !isRunning) return;

    try {
      setIsAnalyzing(true);
      const imageDataUrl = captureFrame(videoRef.current);

      // Analyze frame
      const result = await analyzeImage(imageDataUrl);

      if (result.success && result.discovery) {
        const name = result.discovery.name;

        // Only add if not "unknown" or "mystery"
        if (name.toLowerCase() !== 'mystery object' && name.toLowerCase() !== 'unknown') {
          setPipMessage(`I see a ${name}!`);
          setPipEmotion('excited');

          // Add to session discoveries
          setDiscoveredCount(prev => prev + 1);
          setSessionDiscoveries(prev => {
            const newDiscovery: SessionDiscovery = {
              id: result.discovery!.id,
              name: name,
              timestamp: new Date(),
              confidence: Math.round((result.discovery!.identification_confidence ?? 0.9) * 100),
              selected: true,
              imageUrl: imageDataUrl
            };
            return [...prev, newDiscovery];
          });
        } else {
          setPipMessage('I am not sure what that is. Try another angle?');
          setPipEmotion('thinking');
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied || cameraError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Camera Issue</h2>
        <p className="mb-6 text-gray-400">{cameraError || 'Please enable camera access'}</p>
        <Button onClick={onBack} variant="secondary">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden relative">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-80"
          playsInline
          muted
          autoPlay
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs text-white/80 uppercase tracking-wider font-bold">
              {isAnalyzing ? 'Analyzing...' : 'Live'}
            </span>
            <Button variant="ghost" size="sm" onClick={toggleCamera} className="text-white hover:bg-white/20 ml-2">
              Flip Camera
            </Button>
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-6">

        {/* Pip Mascot */}
        <div className="w-full flex justify-center mt-4">
          <motion.div
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ duration: isRunning ? 1.5 : 0.5, repeat: isRunning ? Infinity : 0 }}
          >
            <PipMascot
              message={pipMessage}
              emotion={pipEmotion}
              size="large"
            />
          </motion.div>
        </div>

        {/* Center Reticle */}
        {isRunning && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="w-64 h-64 border-2 border-white/50 rounded-lg relative"
              animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white" />
            </motion.div>
          </div>
        )}

        {/* Footer Stats & Controls */}
        <div className="w-full max-w-md space-y-6 mb-8">
          {/* Timer */}
          <div className="flex justify-center">
            <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
              <Clock className="w-5 h-5 text-white/70" />
              <span className="text-2xl font-mono font-bold text-white tracking-widest">
                {formatTime(sessionTime)}
              </span>
            </div>
          </div>

          {/* Found Counter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Found</p>
              <p className="text-3xl font-bold text-white">{discoveredCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Session</p>
              <p className="text-3xl font-bold text-green-400">{sessionDiscoveries.length}</p>
            </div>
          </div>

          {/* Live Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-black/30 backdrop-blur rounded-lg p-2 text-center">
                <div className="text-lg">{stat.icon}</div>
                <div className="text-white font-bold">{stat.value}</div>
                <div className="text-[10px] text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Controls Row */}
          <div className="flex justify-center items-center gap-6 mt-4">
            {isRunning && (
              <motion.button
                onClick={captureImage}
                disabled={isAnalyzing}
                className={`
                      w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]
                      transition-all duration-200 border-4 border-white/20
                      bg-blue-500 hover:bg-blue-600 disabled:opacity-50
                  `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full" />
                </div>
              </motion.button>
            )}

            <Button
              onClick={toggleLiveMode}
              variant={isRunning ? "destructive" : "default"}
              size="lg"
              className="rounded-full px-8 py-6 font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)]"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" /> End Session
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> Start Exploring
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
