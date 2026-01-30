import { MOCK_DISCOVERIES } from '@/app/data/mockDiscoveries';
import type { Discovery, RecognitionResult } from '@/app/types';

/**
 * Simulates AI-powered image recognition
 * In production, this would call a real ML API
 */
export async function recognizeImage(): Promise<RecognitionResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // Randomly select a discovery from our mock database
  const randomIndex = Math.floor(Math.random() * MOCK_DISCOVERIES.length);
  const mockDiscovery = MOCK_DISCOVERIES[randomIndex];

  // Create a unique discovery instance
  const discovery: Discovery = {
    ...mockDiscovery,
    id: `discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    discoveredAt: new Date()
  };

  return {
    success: true,
    discovery,
    isDangerous: discovery.isDangerous
  };
}

/**
 * Adapts the story based on child's age
 */
export function adaptStoryForAge(story: string, age: number): string {
  // In a real app, this would use GPT or similar to adapt language
  // For now, we'll just return the story as-is since our mock stories
  // are already written for the target age group (7)
  
  if (age <= 5) {
    // Simplify for younger children
    return story.replace(/super-strong/g, 'very strong')
      .replace(/magnificent/g, 'beautiful');
  } else if (age >= 10) {
    // Add more scientific detail for older children
    return story;
  }
  
  return story;
}
