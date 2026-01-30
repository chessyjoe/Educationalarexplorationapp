import { motion } from 'motion/react';
import { X, Volume2, Sparkles, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Discovery } from '@/app/types';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface DiscoveryDetailProps {
  discovery: Discovery;
  onClose: () => void;
}

export function DiscoveryDetail({ discovery, onClose }: DiscoveryDetailProps) {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(discovery.story);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 bg-gray-100">
          <ImageWithFallback
            src={`https://source.unsplash.com/600x400/?${discovery.imageUrl}`}
            alt={discovery.name}
            className="w-full h-full object-cover"
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white p-0"
          >
            <X className="w-6 h-6" />
          </Button>
          {discovery.isDangerous && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              ⚠️ Dangerous - Don't Touch!
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{discovery.name}</h2>
            {discovery.scientificName && (
              <p className="text-gray-500 italic">{discovery.scientificName}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="capitalize">{discovery.type}</Badge>
            <Badge variant="secondary" className="capitalize">{discovery.category}</Badge>
            <Badge variant="outline" className="capitalize">
              <MapPin className="w-3 h-3 mr-1" />
              {discovery.habitat}
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(discovery.discoveredAt)}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className={`${discovery.isDangerous ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border-2 rounded-2xl p-4`}>
              <p className="text-base leading-relaxed">{discovery.story}</p>
            </div>

            {discovery.funFact && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex gap-3">
                <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Fun Fact!</p>
                  <p className="text-sm leading-relaxed">{discovery.funFact}</p>
                </div>
              </div>
            )}

            {discovery.followUpActivity && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">🎯</span>
                <div>
                  <p className="font-semibold text-purple-800 mb-1">Try This!</p>
                  <p className="text-sm leading-relaxed">{discovery.followUpActivity}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSpeak}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg"
            >
              <Volume2 className="w-6 h-6 mr-2" />
              Read Story Aloud
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
