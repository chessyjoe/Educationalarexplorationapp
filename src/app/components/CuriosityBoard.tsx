import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Grid3x3, Palette, MapPin, Calendar, Sparkles, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { Discovery, SortMode, UserProfile } from '@/app/types';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface CuriosityBoardProps {
  profile: UserProfile;
  onBack: () => void;
  onCardClick: (discovery: Discovery) => void;
}

export function CuriosityBoard({ profile, onBack, onCardClick }: CuriosityBoardProps) {
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [showBadges, setShowBadges] = useState(false);

  const sortDiscoveries = (discoveries: Discovery[], mode: SortMode): Discovery[] => {
    const sorted = [...discoveries];
    
    switch (mode) {
      case 'type':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      case 'color':
        return sorted.sort((a, b) => a.color.localeCompare(b.color));
      case 'habitat':
        return sorted.sort((a, b) => a.habitat.localeCompare(b.habitat));
      case 'date':
        return sorted.sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime());
      default:
        return sorted;
    }
  };

  const sortedDiscoveries = sortDiscoveries(profile.discoveries, sortMode);

  const getColorBadgeColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      brown: 'bg-amber-700',
      multicolor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const unlockedBadges = profile.badges.filter(b => b.unlocked);
  const inProgressBadges = profile.badges.filter(b => !b.unlocked);

  return (
    <div className="h-screen bg-gradient-to-b from-purple-300 via-pink-300 to-orange-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{profile.boardName}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBadges(!showBadges)}
            className="relative"
          >
            <Trophy className="w-5 h-5" />
            {unlockedBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {unlockedBadges.length}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{profile.discoveries.length} discoveries</span>
          <span>by {profile.name}</span>
        </div>

        {/* Sort tabs with visual icons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'date' as SortMode, icon: Calendar, label: '📅', tooltip: 'Date' },
            { value: 'type' as SortMode, icon: Grid3x3, label: '🏷️', tooltip: 'Type' },
            { value: 'color' as SortMode, icon: Palette, label: '🎨', tooltip: 'Color' },
            { value: 'habitat' as SortMode, icon: MapPin, label: '🏞️', tooltip: 'Habitat' }
          ].map(({ value, icon: Icon, label, tooltip }) => (
            <motion.button
              key={value}
              onClick={() => setSortMode(value)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-[1.2rem] font-bold text-2xl transition-all ${
                sortMode === value
                  ? 'bg-white/95 shadow-[0_6px_0_rgba(0,0,0,0.1),0_10px_16px_rgba(0,0,0,0.12)]'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 2 }}
            >
              <span className="text-2xl mb-1">{label}</span>
              <span className="text-xs font-semibold text-gray-700">{tooltip}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Badges Modal */}
      {showBadges && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBadges(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-[0_20px_0_rgba(0,0,0,0.1),0_25px_50px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Badges</h2>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>

            {unlockedBadges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-green-600">Unlocked! 🎉</h3>
                <div className="space-y-3">
                  {unlockedBadges.map((badge) => (
                    <div key={badge.id} className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-[1.5rem] p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
                          {badge.icon === 'bug' && '🐛'}
                          {badge.icon === 'tree-deciduous' && '🌳'}
                          {badge.icon === 'flower' && '🌸'}
                          {badge.icon === 'bird' && '🐦'}
                          {badge.icon === 'sparkles' && '✨'}
                          {badge.icon === 'rainbow' && '🌈'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{badge.name}</h4>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inProgressBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-600">In Progress</h3>
                <div className="space-y-3">
                  {inProgressBadges.map((badge) => (
                    <div key={badge.id} className="bg-gray-100 border-2 border-gray-200 rounded-[1.5rem] p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-2xl opacity-50">
                          {badge.icon === 'bug' && '🐛'}
                          {badge.icon === 'tree-deciduous' && '🌳'}
                          {badge.icon === 'flower' && '🌸'}
                          {badge.icon === 'bird' && '🐦'}
                          {badge.icon === 'sparkles' && '✨'}
                          {badge.icon === 'rainbow' && '🌈'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{badge.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full transition-all"
                                style={{ width: `${((badge.progress || 0) / (badge.total || 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {badge.progress}/{badge.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Cards Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {sortedDiscoveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-20 h-20 text-white/50 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Your Museum is Empty</h3>
            <p className="text-white/80 mb-6">Start exploring to collect discoveries!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-4">
            {/* Discovered cards */}
            {sortedDiscoveries.map((discovery, index) => (
              <motion.div
                key={discovery.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onCardClick(discovery)}
                className="cursor-pointer"
              >
                <div className="bg-white rounded-[1.5rem] shadow-[0_4px_0_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_8px_0_rgba(0,0,0,0.1),0_12px_24px_rgba(0,0,0,0.15)] transition-shadow">
                  <div className="relative h-40 bg-gray-100">
                    <ImageWithFallback
                      src={`https://source.unsplash.com/300x300/?${discovery.imageUrl}`}
                      alt={discovery.name}
                      className="w-full h-full object-cover"
                    />
                    {sortMode === 'color' && (
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full ${getColorBadgeColor(discovery.color)} border-2 border-white shadow-lg`} />
                    )}
                    {discovery.isDangerous && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ⚠️ Danger
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{discovery.name}</h3>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {discovery.category}
                      </Badge>
                      {sortMode === 'habitat' && (
                        <Badge variant="outline" className="text-xs">
                          {discovery.habitat}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Locked/Undiscovered cards for sticker book effect */}
            {[1, 2, 3, 4].map((index) => (
              sortedDiscoveries.length + index <= 12 && (
                <motion.div
                  key={`locked-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (sortedDiscoveries.length + index) * 0.05 }}
                  className="cursor-default"
                >
                  <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-[1.5rem] shadow-[0_4px_0_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.2)] overflow-hidden h-56 flex items-center justify-center group relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                      <div className="text-6xl mb-3 opacity-60">❓</div>
                      <p className="text-white/80 font-bold text-sm px-3">Discovery {sortedDiscoveries.length + index}</p>
                      <p className="text-white/60 text-xs mt-2 px-3">Keep exploring to unlock!</p>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
