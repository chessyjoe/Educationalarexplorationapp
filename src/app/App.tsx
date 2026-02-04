import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CameraInterface } from './components/CameraInterface';
import { ResultScreen } from './components/ResultScreen';
import { CuriosityBoard } from './components/CuriosityBoard';
import { ParentDashboard } from './components/ParentDashboard';
import { DiscoveryDetail } from './components/DiscoveryDetail';
import { ChatScreen } from './components/ChatScreen';
import { VoiceMode } from './components/VoiceMode';
import { LiveDiscovery } from './components/LiveDiscovery';
import { loadUserProfile, saveUserProfile, addDiscovery, getDefaultProfile } from './utils/storage';
import { recognizeImage } from './services/recognitionService';
import type { UserProfile, Discovery } from './types';
import { toast, Toaster } from 'sonner';

type Screen = 'onboarding' | 'welcome' | 'camera' | 'result' | 'board' | 'parent' | 'chat' | 'voice' | 'live';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('pocket_science_onboarding_complete');
    return hasCompletedOnboarding ? 'welcome' : 'onboarding';
  });
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<Discovery | null>(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);

  // Save profile whenever it changes
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  const handleStartExploring = () => {
    setCurrentScreen('camera');
  };

  const handleViewBoard = () => {
    setCurrentScreen('board');
  };

  const handleOpenParentDashboard = () => {
    setCurrentScreen('parent');
  };

  const handleCapture = async () => {
    setIsProcessing(true);
    
    try {
      const result = await recognizeImage();
      
      if (result.success && result.discovery) {
        setCurrentDiscovery(result.discovery);
        setCurrentScreen('result');
      } else {
        toast.error('Could not identify this item. Try again!');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToBoard = () => {
    if (currentDiscovery) {
      const updatedProfile = addDiscovery(profile, currentDiscovery);
      
      // Check if discovery was new
      if (updatedProfile.discoveries.length > profile.discoveries.length) {
        setProfile(updatedProfile);
        toast.success(`${currentDiscovery.name} added to your museum!`, {
          description: 'Check your board to see your collection.'
        });
        
        // Check for newly unlocked badges
        const newlyUnlocked = updatedProfile.badges.filter(
          (badge, index) => badge.unlocked && !profile.badges[index].unlocked
        );
        
        if (newlyUnlocked.length > 0) {
          setTimeout(() => {
            newlyUnlocked.forEach(badge => {
              toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
                description: badge.description
              });
            });
          }, 500);
        }
      } else {
        toast.info('You already have this in your collection!');
      }
      
      setCurrentScreen('camera');
      setCurrentDiscovery(null);
    }
  };

  const handleTryAgain = () => {
    setCurrentScreen('camera');
    setCurrentDiscovery(null);
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setCurrentDiscovery(null);
    setSelectedDiscovery(null);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    toast.success('Settings updated!');
  };

  const handleClearData = () => {
    const defaultProfile = loadUserProfile();
    // Clear localStorage
    localStorage.removeItem('pocket_science_user');
    // Reset to default
    setProfile(defaultProfile);
    toast.success('All data cleared');
  };

  const handleCardClick = (discovery: Discovery) => {
    setSelectedDiscovery(discovery);
  };

  const unlockedBadges = profile.badges.filter(b => b.unlocked).length;

  const handleCompleteOnboarding = (name: string, age: number) => {
    const updatedProfile = { ...profile, name, age, boardName: `${name}'s Museum` };
    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    localStorage.setItem('pocket_science_onboarding_complete', 'true');
    setCurrentScreen('welcome');
    toast.success(`Welcome, ${name}! Let's start exploring!`);
  };
  
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-100">
      <Toaster position="top-center" richColors />
      
      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          onComplete={handleCompleteOnboarding}
        />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          userName={profile.name}
          onStartExploring={handleStartExploring}
          onViewBoard={handleViewBoard}
          onOpenParentDashboard={handleOpenParentDashboard}
          discoveryCount={profile.discoveries.length}
          badgeCount={unlockedBadges}
        />
      )}

      {currentScreen === 'camera' && (
        <CameraInterface
          onCapture={handleCapture}
          isProcessing={isProcessing}
          onBack={handleBackToWelcome}
        />
      )}

      {currentScreen === 'result' && currentDiscovery && (
        <ResultScreen
          discovery={currentDiscovery}
          onAddToBoard={handleAddToBoard}
          onTryAgain={handleTryAgain}
        />
      )}

      {currentScreen === 'board' && (
        <CuriosityBoard
          profile={profile}
          onBack={handleBackToWelcome}
          onCardClick={handleCardClick}
        />
      )}

      {currentScreen === 'parent' && (
        <ParentDashboard
          profile={profile}
          onBack={handleBackToWelcome}
          onUpdateProfile={handleUpdateProfile}
          onClearData={handleClearData}
        />
      )}

      {selectedDiscovery && (
        <DiscoveryDetail
          discovery={selectedDiscovery}
          onClose={() => setSelectedDiscovery(null)}
        />
      )}
    </div>
  );
}
