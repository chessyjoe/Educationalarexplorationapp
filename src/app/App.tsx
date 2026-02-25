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
import { LiveDiscoveryResults } from './components/LiveDiscoveryResults';
import { APISetupGuide } from './components/APISetupGuide';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileButton } from '@/components/user/UserProfileButton';
import { loadUserProfile, saveUserProfile, addDiscovery } from './utils/storage';
import { recognizeImage } from './services/recognitionService';
import { discoveryAPI } from '@/services/apiService';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import type { UserProfile, Discovery } from './types';
import { toast, Toaster } from 'sonner';

type Screen = 'onboarding' | 'welcome' | 'camera' | 'result' | 'board' | 'parent' | 'chat' | 'voice' | 'live' | 'live-results' | 'api-setup';

interface SessionDiscovery {
  id: string;
  name: string;
  timestamp: Date;
  confidence: number;
  selected: boolean;
  imageUrl?: string;
}

export default function App() {
  // Enable PWA update handling
  usePWAUpdate();

  // Auth state
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('pocket_science_onboarding_complete');
    return hasCompletedOnboarding ? 'welcome' : 'onboarding';
  });
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<Discovery | null>(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);
  const [sessionDiscoveries, setSessionDiscoveries] = useState<SessionDiscovery[]>([]);


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
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      toast.info('Please sign in to access Parental Dashboard');
      return;
    }
    setCurrentScreen('parent');
  };

  const handleOpenChat = () => {
    setCurrentScreen('chat');
  };

  const handleOpenVoiceMode = () => {
    setCurrentScreen('voice');
  };

  const handleOpenLiveDiscovery = () => {
    setCurrentScreen('live');
  };

  const handleLiveDiscovery = (count: number) => {
    if (count > 0) {
      toast.success(`Found discovery! Total: ${count}`, {
        description: 'Keep scanning!'
      });
    }
  };

  const handleLiveSessionComplete = (discoveries: SessionDiscovery[]) => {
    setSessionDiscoveries(discoveries);
    setCurrentScreen('live-results');
  };

  const handleLiveResultsConfirm = async (selectedDiscoveries: SessionDiscovery[]) => {
    if (selectedDiscoveries.length === 0) {
      setCurrentScreen('camera');
      setSessionDiscoveries([]);
      return;
    }

    let updatedProfile = profile;
    let saved = 0;

    for (const sessionDisc of selectedDiscoveries) {
      // Build a minimal Discovery object for the board
      const discovery: Discovery = {
        id: sessionDisc.id,
        name: sessionDisc.name,
        type: 'fauna',
        category: 'nature',
        color: 'green',
        habitat: 'outdoors',
        isDangerous: false,
        story: '',
        funFact: '',
        imageUrl: sessionDisc.imageUrl || '',
        capturedImage: sessionDisc.imageUrl,
        discoveredAt: sessionDisc.timestamp,
        identification_confidence: sessionDisc.confidence / 100,
      };

      updatedProfile = addDiscovery(updatedProfile, discovery);
      saved++;
    }

    setProfile(updatedProfile);

    // Persist to backend if authenticated
    if (user) {
      try {
        for (const sessionDisc of selectedDiscoveries) {
          await discoveryAPI.create({
            child_id: undefined,
            child_name: profile.name,
            child_age: profile.age,
            discovery_description: `Live scan: found a ${sessionDisc.name}`,
            media_type: 'image',
            media_data: sessionDisc.imageUrl || '',
          });
        }
      } catch (e) {
        console.warn('Could not sync live results to backend:', e);
      }
    }

    toast.success(
      `Saved ${saved} discover${saved !== 1 ? 'ies' : 'y'} to your board!`,
      { description: 'Check your museum to see them.' }
    );
    setCurrentScreen('camera');
    setSessionDiscoveries([]);
  };

  const handleCapture = async (imageDataUrl: string) => {
    setIsProcessing(true);

    try {
      const result = await recognizeImage(imageDataUrl);

      if (result.success && result.discovery) {
        // Attach captured image to discovery
        const discoveryWithImage = {
          ...result.discovery,
          capturedImage: imageDataUrl
        };
        setCurrentDiscovery(discoveryWithImage);
        setCurrentScreen('result');
      } else {
        // Show API setup guide if API not configured
        if (result.error?.includes('not configured')) {
          setCurrentScreen('api-setup');
        } else {
          const errorMsg = result.error || 'Could not identify this item. Try again!';
          toast.error(errorMsg);
        }
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
      <PWAInstallPrompt />

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
          onOpenChat={handleOpenChat}
          onOpenVoiceMode={handleOpenVoiceMode}
          onOpenLiveDiscovery={handleOpenLiveDiscovery}
        />
      )}

      {currentScreen === 'result' && currentDiscovery && (
        <ErrorBoundary>
          <ResultScreen
            discovery={currentDiscovery}
            onAddToBoard={handleAddToBoard}
            onTryAgain={handleTryAgain}
          />
        </ErrorBoundary>
      )}

      {currentScreen === 'board' && (
        <CuriosityBoard
          profile={profile}
          onBack={handleBackToWelcome}
          onCardClick={handleCardClick}
        />
      )}

      {currentScreen === 'parent' && (
        <ProtectedRoute
          onAuthRequired={() => {
            setShowAuthModal(true);
            setCurrentScreen('welcome');
            toast.info('Please sign in to access Parental Dashboard');
          }}
        >
          <ParentDashboard
            profile={profile}
            onBack={handleBackToWelcome}
            onUpdateProfile={handleUpdateProfile}
            onClearData={handleClearData}
          />
        </ProtectedRoute>
      )}

      {currentScreen === 'chat' && (
        <ChatScreen
          profile={profile}
          onBack={handleBackToWelcome}
          discoveries={profile.discoveries}
        />
      )}

      {currentScreen === 'voice' && (
        <VoiceMode
          profile={profile}
          onBack={handleBackToWelcome}
        />
      )}

      {currentScreen === 'live' && (
        <LiveDiscovery
          profile={profile}
          onBack={handleBackToWelcome}
          onDiscovery={handleLiveDiscovery}
          onSessionComplete={handleLiveSessionComplete}
        />
      )}

      {currentScreen === 'live-results' && (
        <LiveDiscoveryResults
          discoveries={sessionDiscoveries}
          onBack={() => setCurrentScreen('live')}
          onConfirm={handleLiveResultsConfirm}
        />
      )}

      {currentScreen === 'api-setup' && (
        <APISetupGuide
          onBack={handleBackToWelcome}
        />
      )}

      {selectedDiscovery && (
        <DiscoveryDetail
          discovery={selectedDiscovery}
          onClose={() => setSelectedDiscovery(null)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Profile Button - Fixed position in top-right */}
      <div className="fixed top-4 right-4 z-40">
        <UserProfileButton />
      </div>
    </div>
  );
}
