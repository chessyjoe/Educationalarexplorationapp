export interface Discovery {
  id: string;
  name: string;
  scientificName?: string;
  type: 'flora' | 'fauna';
  category: string; // e.g., 'bird', 'insect', 'tree', 'flower'
  color: string;
  habitat: string;
  isDangerous: boolean;
  story: string;
  funFact: string;
  imageUrl: string;
  discoveredAt: Date;
  followUpActivity?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  boardName: string;
  discoveries: Discovery[];
  badges: Badge[];
}

export type SortMode = 'type' | 'color' | 'habitat' | 'date';

export interface RecognitionResult {
  success: boolean;
  discovery?: Discovery;
  isDangerous?: boolean;
  warningMessage?: string;
}
