import type { UserProfile, Discovery, Badge } from '@/app/types';

const STORAGE_KEY = 'pocket_science_user';
const ONBOARDING_KEY = 'pocket_science_onboarding_complete';
const PARENT_PIN = '1234'; // Default PIN for demo

/** Returns a user-scoped localStorage key for authenticated users. */
export function getUserStorageKey(uid: string): string {
  return `${STORAGE_KEY}_${uid}`;
}

/** Returns a user-scoped onboarding flag key for authenticated users. */
export function getOnboardingKey(uid?: string): string {
  return uid ? `${ONBOARDING_KEY}_${uid}` : ONBOARDING_KEY;
}

export const defaultBadges: Badge[] = [
  {
    id: 'beetle-boss',
    name: 'Beetle Boss',
    description: 'Find 5 different insects',
    icon: 'bug',
    unlocked: false,
    progress: 0,
    total: 5
  },
  {
    id: 'tree-hugger',
    name: 'Tree Hugger',
    description: 'Discover 3 different trees',
    icon: 'tree-deciduous',
    unlocked: false,
    progress: 0,
    total: 3
  },
  {
    id: 'flower-power',
    name: 'Flower Power',
    description: 'Collect 5 different flowers',
    icon: 'flower',
    unlocked: false,
    progress: 0,
    total: 5
  },
  {
    id: 'bird-watcher',
    name: 'Bird Watcher',
    description: 'Spot 3 different birds',
    icon: 'bird',
    unlocked: false,
    progress: 0,
    total: 3
  },
  {
    id: 'curious-collector',
    name: 'Curious Collector',
    description: 'Find your first 10 discoveries',
    icon: 'sparkles',
    unlocked: false,
    progress: 0,
    total: 10
  },
  {
    id: 'rainbow-explorer',
    name: 'Rainbow Explorer',
    description: 'Collect items of 5 different colors',
    icon: 'rainbow',
    unlocked: false,
    progress: 0,
    total: 5
  }
];

export function getDefaultProfile(): UserProfile {
  return {
    name: 'Explorer',
    age: 7,
    boardName: "My Museum",
    discoveries: [],
    badges: defaultBadges
  };
}

export function loadUserProfile(uid?: string): UserProfile {
  const key = uid ? getUserStorageKey(uid) : STORAGE_KEY;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const profile = JSON.parse(stored);
      // Convert date strings back to Date objects
      profile.discoveries = profile.discoveries.map((d: Discovery) => ({
        ...d,
        discoveredAt: new Date(d.discoveredAt)
      }));
      return profile;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
  return getDefaultProfile();
}

export function saveUserProfile(profile: UserProfile, uid?: string): void {
  const key = uid ? getUserStorageKey(uid) : STORAGE_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
}

/** Clears all stored data for a specific authenticated user. */
export function clearUserData(uid: string): void {
  localStorage.removeItem(getUserStorageKey(uid));
  localStorage.removeItem(getOnboardingKey(uid));
}

export function addDiscovery(profile: UserProfile, discovery: Discovery): UserProfile {
  // Check if already discovered
  const exists = profile.discoveries.some(d => d.name === discovery.name);
  if (exists) {
    return profile;
  }

  const newDiscoveries = [...profile.discoveries, discovery];
  const updatedBadges = updateBadges(profile.badges, newDiscoveries);

  return {
    ...profile,
    discoveries: newDiscoveries,
    badges: updatedBadges
  };
}

function updateBadges(badges: Badge[], discoveries: Discovery[]): Badge[] {
  const newBadges = [...badges];

  // Count discoveries by category
  const insectCount = discoveries.filter(d => d.category === 'insect').length;
  const treeCount = discoveries.filter(d => d.category === 'tree').length;
  const flowerCount = discoveries.filter(d => d.category === 'flower').length;
  const birdCount = discoveries.filter(d => d.category === 'bird').length;
  const totalCount = discoveries.length;
  const colorCount = new Set(discoveries.map(d => d.color)).size;

  // Update badge progress
  newBadges.forEach(badge => {
    switch (badge.id) {
      case 'beetle-boss':
        badge.progress = insectCount;
        badge.unlocked = insectCount >= 5;
        break;
      case 'tree-hugger':
        badge.progress = treeCount;
        badge.unlocked = treeCount >= 3;
        break;
      case 'flower-power':
        badge.progress = flowerCount;
        badge.unlocked = flowerCount >= 5;
        break;
      case 'bird-watcher':
        badge.progress = birdCount;
        badge.unlocked = birdCount >= 3;
        break;
      case 'curious-collector':
        badge.progress = totalCount;
        badge.unlocked = totalCount >= 10;
        break;
      case 'rainbow-explorer':
        badge.progress = colorCount;
        badge.unlocked = colorCount >= 5;
        break;
    }
  });

  return newBadges;
}

export function verifyParentPIN(pin: string): boolean {
  return pin === PARENT_PIN;
}

export function clearAllData(uid?: string): void {
  if (uid) {
    clearUserData(uid);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  }
}
