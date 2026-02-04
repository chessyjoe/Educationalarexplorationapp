import { motion } from 'motion/react';
import { Camera, Sparkles, Trophy, Settings, MessageCircle, Zap, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';

interface WelcomeScreenProps {
  userName: string;
  onStartExploring: () => void;
  onViewBoard: () => void;
  onOpenParentDashboard: () => void;
  onOpenChat: () => void;
  onOpenVoiceMode: () => void;
  onOpenLiveDiscovery: () => void;
  discoveryCount: number;
  badgeCount: number;
}

export function WelcomeScreen({
  userName,
  onStartExploring,
  onViewBoard,
  onOpenParentDashboard,
  onOpenChat,
  onOpenVoiceMode,
  onOpenLiveDiscovery,
  discoveryCount,
  badgeCount
}: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Parent Settings Button */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="sm"
          onClick={onOpenParentDashboard}
          className="bg-white/80 hover:bg-white text-gray-800 shadow-[0_4px_0_rgba(0,0,0,0.1),0_6px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_0_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.15)] active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.06)] active:translate-y-0.5 rounded-[1.2rem]"
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
          className="w-full text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-[0_10px_0_rgba(0,0,0,0.15),0_14px_28px_rgba(0,0,0,0.15)] hover:shadow-[0_14px_0_rgba(0,0,0,0.15),0_18px_32px_rgba(0,0,0,0.2)] active:shadow-[0_4px_0_rgba(0,0,0,0.1),0_6px_12px_rgba(0,0,0,0.08)] active:translate-y-1 rounded-[1.5rem]"
        >
          <Camera className="w-8 h-8 mr-3" />
          Start Exploring!
        </Button>

        <Button
          size="lg"
          onClick={onViewBoard}
          className="w-full text-lg bg-white/95 hover:bg-white text-gray-800 shadow-[0_10px_0_rgba(0,0,0,0.1),0_14px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_14px_0_rgba(0,0,0,0.12),0_18px_32px_rgba(0,0,0,0.15)] active:shadow-[0_4px_0_rgba(0,0,0,0.08),0_6px_12px_rgba(0,0,0,0.06)] active:translate-y-1 rounded-[1.5rem]"
        >
          <Sparkles className="w-8 h-8 mr-3 text-purple-500" />
          My Museum
          {discoveryCount > 0 && (
            <span className="ml-2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              {discoveryCount}
            </span>
          )}
        </Button>

        {badgeCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="bg-white/95 rounded-[1.5rem] p-4 shadow-[0_6px_0_rgba(0,0,0,0.08),0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3"
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
