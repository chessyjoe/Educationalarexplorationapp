import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PipMascot } from './PipMascot';

interface OnboardingScreenProps {
  onComplete: (name: string, age: number) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('7');

  const steps = [
    {
      title: 'Welcome to Pocket Science!',
      message: "Hi there! I'm Pip, your exploration buddy! Together we'll discover amazing things in nature!",
      emoji: '👋',
      color: 'from-blue-400 to-purple-500'
    },
    {
      title: 'How It Works',
      message: "Point your camera at plants and animals, and I'll tell you all about them with fun stories!",
      emoji: '📸',
      color: 'from-green-400 to-blue-500'
    },
    {
      title: 'Build Your Museum',
      message: 'Every discovery goes into your personal museum. Collect them all and unlock special badges!',
      emoji: '🏆',
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: "Let's Get Started!",
      message: "First, tell me your name and age so I can make the stories just right for you!",
      emoji: '✨',
      color: 'from-orange-400 to-red-500'
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (name.trim() && age) {
      onComplete(name.trim(), parseInt(age) || 7);
    }
  };

  const canComplete = step === steps.length - 1 && name.trim().length > 0;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentStep.color} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: 360
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: 'linear'
            }}
          >
            {currentStep.emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl mb-6"
            >
              {currentStep.emoji}
            </motion.div>

            <h1 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
              {currentStep.title}
            </h1>

            <div className="mb-8">
              <PipMascot
                message={currentStep.message}
                emotion={step === steps.length - 1 ? 'excited' : 'happy'}
                size="medium"
              />
            </div>

            {step === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[2rem] p-6 w-full shadow-[0_10px_0_rgba(0,0,0,0.12),0_15px_30px_rgba(0,0,0,0.15)] space-y-4"
              >
                <div>
                  <Label htmlFor="name" className="text-gray-700">
                    What's your name?
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 h-12 text-lg"
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-gray-700">
                    How old are you?
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    className="mt-2 h-12 text-lg"
                    min={3}
                    max={12}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="flex-1 bg-white/90 hover:bg-white h-14"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              size="lg"
              className={`${step === 0 ? 'w-full' : 'flex-1'} bg-white text-gray-800 hover:bg-gray-100 h-14 text-lg`}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              size="lg"
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white h-14 text-lg shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Exploring!
            </Button>
          )}
        </div>

        {step === 0 && (
          <motion.button
            onClick={() => onComplete('Explorer', 7)}
            className="mt-4 w-full text-white/70 text-sm hover:text-white transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Skip intro
          </motion.button>
        )}
      </div>
    </div>
  );
}
