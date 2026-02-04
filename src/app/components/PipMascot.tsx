import { motion } from 'motion/react';

interface PipMascotProps {
  message: string;
  emotion?: 'happy' | 'excited' | 'thinking' | 'warning';
  size?: 'small' | 'medium' | 'large';
}

export function PipMascot({ message, emotion = 'happy', size = 'medium' }: PipMascotProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const emotionColors = {
    happy: 'from-blue-400 to-purple-500',
    excited: 'from-yellow-400 to-orange-500',
    thinking: 'from-teal-400 to-blue-500',
    warning: 'from-red-400 to-orange-500'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${emotionColors[emotion]} flex items-center justify-center shadow-lg`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: emotion === 'excited' ? [0, -5, 5, -5, 0] : 0,
          scaleX: [1, 0.92, 1.08, 0.95, 1],
          scaleY: [1, 1.08, 0.92, 1.05, 1]
        }}
        transition={{
          duration: emotion === 'excited' ? 0.5 : 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: emotion === 'excited' ? 'easeInOut' : 'easeInOut'
        }}
      >
        {/* Pip's face */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Eyes */}
          <div className="absolute top-1/3 flex gap-2">
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={emotion === 'thinking' ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={emotion === 'thinking' ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          {/* Mouth */}
          <div className="absolute bottom-1/3">
            {emotion === 'warning' ? (
              <div className="w-1 h-3 bg-white rounded-full" />
            ) : (
              <div className="w-4 h-2 border-b-2 border-white rounded-b-full" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        className="relative bg-white rounded-[1.5rem] px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-w-xs"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 200 }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
        <p className="relative z-10 text-center text-sm leading-relaxed font-medium text-gray-800">
          {message}
        </p>
      </motion.div>
    </div>
  );
}
