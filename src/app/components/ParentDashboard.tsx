import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Trash2, User, Calendar, BarChart3, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import type { UserProfile } from '@/app/types';
import { verifyParentPIN } from '@/app/utils/storage';

interface ParentDashboardProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClearData: () => void;
}

export function ParentDashboard({ profile, onBack, onUpdateProfile, onClearData }: ParentDashboardProps) {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (verifyParentPIN(pinInput)) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN. Try: 1234');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all discoveries? This cannot be undone.')) {
      onClearData();
      onBack();
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Parent Dashboard</h1>
          <p className="text-center text-gray-600 mb-6">Enter PIN to access parental controls</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="text-center text-2xl tracking-widest h-14"
                maxLength={4}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <Button onClick={handleUnlock} className="w-full h-12" size="lg">
              Unlock Dashboard
            </Button>

            <Button onClick={onBack} variant="outline" className="w-full">
              Back to App
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <p className="text-xs text-blue-800">
                <strong>Demo PIN:</strong> 1234
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const categoryStats = profile.discoveries.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const habitatStats = profile.discoveries.reduce((acc, d) => {
    acc[d.habitat] = (acc[d.habitat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex flex-col">
      <div className="bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Parent Dashboard</h1>
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold">Profile Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                value={profile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => onUpdateProfile({ age: parseInt(e.target.value) || 7 })}
                className="h-12"
                min={3}
                max={12}
              />
            </div>

            <div>
              <Label htmlFor="boardName">Museum Name</Label>
              <Input
                id="boardName"
                value={profile.boardName}
                onChange={(e) => onUpdateProfile({ boardName: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        </Card>

        {/* Activity Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Activity Summary</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{profile.discoveries.length}</div>
              <div className="text-sm text-gray-600">Total Discoveries</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {profile.badges.filter(b => b.unlocked).length}
              </div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">By Category</h3>
              <div className="space-y-2">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / profile.discoveries.length) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">By Habitat</h3>
              <div className="space-y-2">
                {Object.entries(habitatStats).map(([habitat, count]) => (
                  <div key={habitat} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{habitat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(count / profile.discoveries.length) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy & Safety */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Privacy & Safety</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-green-900">No Location Tracking</p>
                <p className="text-green-700">GPS coordinates are never stored or shared</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-green-900">Local Storage Only</p>
                <p className="text-green-700">All data stays on this device</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="font-semibold text-green-900">Safety Warnings</p>
                <p className="text-green-700">Dangerous items are flagged before identification</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold">Data Management</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Clear all discoveries and reset the app to start fresh. This action cannot be undone.
          </p>

          <Button
            onClick={handleClearData}
            variant="destructive"
            className="w-full h-12"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear All Data
          </Button>
        </Card>

        {/* App Info */}
        <Card className="p-6 bg-indigo-50 border-indigo-200">
          <h3 className="font-semibold mb-2">About Pocket Science</h3>
          <p className="text-sm text-gray-600 mb-3">
            An educational app that encourages outdoor exploration and curiosity through AR identification and interactive storytelling.
          </p>
          <div className="text-xs text-gray-500">
            <p>Version 1.0.0 (MVP)</p>
            <p>Compliant with COPPA & GDPR-K regulations</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
