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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, rgba(147, 197, 253, 0.85) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(244, 114, 182, 0.85) 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M30 15c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 4c6.075 0 11 4.925 11 11s-4.925 11-11 11-11-4.925-11-11 4.925-11 11-11z'/%3E%3Cpath d='M8 2c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3Cpath d='M50 2c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundSize: 'cover, 200px 200px',
        backgroundAttachment: 'fixed'
      }}
    >
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
        <h1 className="text-6xl font-bold text-white mb-2 text-bubble">
          Pocket Science
        </h1>
        <p className="text-xl text-white/95 drop-shadow-md font-semibold">
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
