import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { PipMascot } from './PipMascot';

interface SessionDiscovery {
  id: string;
  name: string;
  timestamp: Date;
  confidence: number;
  selected: boolean;
}

interface LiveDiscoveryResultsProps {
  discoveries: SessionDiscovery[];
  onBack: () => void;
  onConfirm: (selectedDiscoveries: SessionDiscovery[]) => void;
}

export function LiveDiscoveryResults({
  discoveries,
  onBack,
  onConfirm
}: LiveDiscoveryResultsProps) {
  const [items, setItems] = useState<SessionDiscovery[]>(discoveries);
  const selectedCount = items.filter(d => d.selected).length;

  const toggleSelection = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAll = () => {
    setItems(items.map(item => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setItems(items.map(item => ({ ...item, selected: false })));
  };

  const handleConfirm = () => {
    const selected = items.filter(d => d.selected);
    onConfirm(selected);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-md p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Your Discoveries
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {discoveries.length} found • {selectedCount} selected
            </p>
          </div>
        </div>
      </div>

      {/* Pip Mascot - celebratory message */}
      {discoveries.length > 0 && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <PipMascot
              message={`You found ${discoveries.length} discoveries! Which ones do you want to save?`}
              emotion="excited"
              size="medium"
            />
          </motion.div>
        </div>
      )}

      {/* Discoveries List */}
      {discoveries.length > 0 ? (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-3 max-w-2xl mx-auto">
            {items.map((discovery, idx) => (
              <motion.div
                key={discovery.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => toggleSelection(discovery.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Checkbox */}
                  <motion.div
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      discovery.selected
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    animate={{
                      scale: discovery.selected ? [1, 1.2, 1] : 1
                    }}
                  >
                    {discovery.selected && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </motion.div>

                  {/* Discovery Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {discovery.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(discovery.timestamp)}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-gradient bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                      {discovery.confidence}%
                    </div>
                    <p className="text-xs text-gray-500">confidence</p>
                  </div>
                </div>

                {/* Selection highlight */}
                {discovery.selected && (
                  <motion.div
                    className="h-1 bg-gradient-to-r from-green-500 to-blue-500"
                    layoutId="active-highlight"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              No discoveries found in this session.
            </p>
            <p className="text-sm text-gray-500">
              Try again to find amazing things in nature!
            </p>
          </div>
        </div>
      )}

      {/* Footer - Actions */}
      {discoveries.length > 0 && (
        <div className="flex-shrink-0 bg-white/95 backdrop-blur shadow-lg p-4 sm:p-6 border-t border-gray-200">
          <div className="space-y-3 max-w-2xl mx-auto">
            {/* Quick actions */}
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Deselect All
              </button>
            </div>

            {/* Confirm button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                selectedCount > 0
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Save {selectedCount > 0 ? selectedCount : 0} Discovery{selectedCount !== 1 ? 'ies' : 'y'}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
