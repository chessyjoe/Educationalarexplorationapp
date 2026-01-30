import { motion } from 'motion/react';
import { Camera, Sparkles, Trophy, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';

interface WelcomeScreenProps {
  userName: string;
  onStartExploring: () => void;
  onViewBoard: () => void;
  onOpenParentDashboard: () => void;
  discoveryCount: number;
  badgeCount: number;
}

export function WelcomeScreen({
  userName,
  onStartExploring,
  onViewBoard,
  onOpenParentDashboard,
  discoveryCount,
  badgeCount
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating elements animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              opacity: 0.3
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: 360
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear'
            }}
          >
            {['🌸', '🦋', '🐛', '🌿', '🌻', '🐦'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      {/* Parent Settings Button */}
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenParentDashboard}
          className="bg-white/20 hover:bg-white/30 backdrop-blur text-white"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Pocket Science
        </h1>
        <p className="text-xl text-white/90 drop-shadow">
          Your Nature Adventure Starts Here!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 relative z-10"
      >
        <PipMascot
          message={`Hi ${userName}! Ready to discover amazing things today?`}
          emotion="excited"
          size="large"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-4 relative z-10"
      >
        <Button
          size="lg"
          onClick={onStartExploring}
          className="w-full h-16 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-2xl"
        >
          <Camera className="w-8 h-8 mr-3" />
          Start Exploring!
        </Button>

        <Button
          size="lg"
          onClick={onViewBoard}
          variant="outline"
          className="w-full h-16 text-xl bg-white/95 hover:bg-white shadow-xl"
        >
          <Sparkles className="w-8 h-8 mr-3 text-purple-500" />
          My Museum
          {discoveryCount > 0 && (
            <span className="ml-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
              {discoveryCount}
            </span>
          )}
        </Button>

        {badgeCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="bg-white/95 rounded-2xl p-4 shadow-xl flex items-center justify-center gap-3"
          >
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-bold text-gray-800">
                {badgeCount} Badge{badgeCount !== 1 ? 's' : ''} Earned!
              </p>
              <p className="text-sm text-gray-600">Keep exploring to unlock more</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center relative z-10"
      >
        <p className="text-white/80 text-sm">
          🌍 Explore · 📸 Discover · 🎓 Learn
        </p>
        <p className="text-white/60 text-xs mt-2">
          Pocket Science v1.0 - Educational AR Explorer
        </p>
      </motion.div>
    </div>
  );
}