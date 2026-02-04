import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowLeft, Pause, Play, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';
import type { UserProfile, Discovery } from '@/app/types';

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
}

const MAX_SESSION_DURATION = 5 * 60; // 5 minutes in seconds
const SESSION_STORAGE_KEY = 'live_discovery_session';

export function LiveDiscovery({ profile, onBack, onDiscovery, onSessionComplete }: LiveDiscoveryProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDiscoveries, setSessionDiscoveries] = useState<SessionDiscovery[]>([]);
  const [pipMessage, setPipMessage] = useState('Ready to discover? Let\'s go!');
  const [pipEmotion, setPipEmotion] = useState<'happy' | 'excited' | 'thinking' | 'warning'>('happy');
  const [stats, setStats] = useState<LiveStat[]>([
    { label: 'Discoveries Today', value: 0, icon: '🔍' },
    { label: 'New Species', value: 0, icon: '🆕' },
    { label: 'Streak', value: 7, icon: '🔥' }
  ]);

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
        // Will be called to show results screen
        onSessionComplete(sessionDiscoveries);
      }
    }
  };

  // Simulate continuous discovery with session tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSessionTime(t => {
          const newTime = t + 1;

          // Auto-stop at max duration
          if (newTime >= MAX_SESSION_DURATION) {
            setIsRunning(false);
            setPipMessage('Time\'s up! Let\'s check your discoveries.');
            setPipEmotion('happy');
            return t;
          }

          return newTime;
        });

        // Randomly trigger new discoveries
        if (Math.random() < 0.15) {
          const discoveryNames = [
            'Oak Tree', 'Butterfly', 'Rose Flower', 'Sparrow', 'Fern',
            'Beetle', 'Daisy', 'Pine Tree', 'Ant', 'Tulip'
          ];
          const randomName = discoveryNames[Math.floor(Math.random() * discoveryNames.length)];

          setDiscoveredCount(prev => {
            const newCount = prev + 1;

            // Add to session discoveries
            const newDiscovery: SessionDiscovery = {
              id: `discovery-${newCount}-${Date.now()}`,
              name: randomName,
              timestamp: new Date(),
              confidence: Math.round(70 + Math.random() * 30), // 70-100%
              selected: true
            };

            setSessionDiscoveries(prev => [...prev, newDiscovery]);

            onDiscovery(newCount);
            return newCount;
          });

          // Update stats
          setStats(prev => prev.map(stat => {
            if (stat.label === 'Discoveries Today') {
              return { ...stat, value: stat.value + 1 };
            }
            if (stat.label === 'New Species' && Math.random() < 0.3) {
              return { ...stat, value: stat.value + 1 };
            }
            return stat;
          }));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, onDiscovery, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gradient-to-b from-amber-300 via-orange-300 to-red-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Live Discovery</h1>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </div>
        <p className="text-sm text-gray-600">Real-time continuous discovery scanning. Point your camera and explore!</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 space-y-6">
        {/* Pip Mascot - responsive */}
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

        {/* Main Display Area */}
        <div className="relative w-full max-w-md">
          {/* Camera Preview Placeholder */}
          <div className="bg-gradient-to-b from-blue-300 to-green-300 rounded-[2rem] overflow-hidden shadow-2xl aspect-video flex items-center justify-center relative">
            <div className="text-center z-10">
              <motion.div
                animate={{ scale: isRunning ? [1, 1.2, 1] : 1 }}
                transition={{ duration: isRunning ? 1 : 0, repeat: isRunning ? Infinity : 0 }}
                className="text-6xl mb-3"
              >
                📷
              </motion.div>
              <p className="text-white font-bold drop-shadow-lg">
                {isRunning ? 'Scanning...' : 'Camera Preview'}
              </p>
            </div>

            {/* Scanning animation */}
            {isRunning && (
              <>
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-white border-r-white rounded-[2rem]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute top-4 left-4 right-4 h-1 bg-white opacity-50 rounded"
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </>
            )}
          </div>

          {/* Discovery Counter */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-6 -right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl"
          >
            <div className="text-center">
              <p className="text-sm font-bold">Found</p>
              <p className="text-2xl font-bold">{discoveredCount}</p>
            </div>
          </motion.div>
        </div>

        {/* Session Timer with time limit indicator */}
        <div className="space-y-3">
          <motion.div
            className="text-4xl font-bold text-white drop-shadow-lg tracking-wider"
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          >
            {formatTime(sessionTime)} / {formatTime(MAX_SESSION_DURATION)}
          </motion.div>

          {/* Time remaining indicator */}
          {isRunning && (
            <motion.div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-white opacity-70" />
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all ${
                    sessionTime > MAX_SESSION_DURATION * 0.9
                      ? 'bg-red-400'
                      : sessionTime > MAX_SESSION_DURATION * 0.7
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(sessionTime / MAX_SESSION_DURATION) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[1.5rem] p-4 shadow-lg text-center"
            >
              <p className="text-3xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Play/Pause Button */}
        <motion.button
          onClick={toggleLiveMode}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center shadow-2xl
            transition-all duration-200 font-bold text-white text-sm
            ${isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
        >
          {isRunning ? (
            <Pause className="w-10 h-10" />
          ) : (
            <Play className="w-10 h-10 ml-1" />
          )}
        </motion.button>
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur p-4">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-gradient bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              {profile.discoveries.length}
            </p>
            <p className="text-xs text-gray-600">Total Discoveries</p>
          </div>
          <div className="w-px h-12 bg-gray-300" />
          <div>
            <p className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {discoveredCount}
            </p>
            <p className="text-xs text-gray-600">This Session</p>
          </div>
          <div className="w-px h-12 bg-gray-300" />
          <div>
            <p className="text-2xl font-bold text-amber-600">{sessionTime > 0 ? Math.floor(discoveredCount / (sessionTime / 60)) : 0}</p>
            <p className="text-xs text-gray-600">Per Minute</p>
          </div>
        </div>
      </div>
    </div>
  );
}
