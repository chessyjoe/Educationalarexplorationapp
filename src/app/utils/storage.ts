import type { UserProfile, Discovery, Badge } from '@/app/types';

const STORAGE_KEY = 'pocket_science_user';
const PARENT_PIN = '1234'; // Default PIN for demo

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

export function loadUserProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
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

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
