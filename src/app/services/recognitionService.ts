import type { Discovery, RecognitionResult } from '@/app/types';

/**
 * Analyzes a captured image from the camera for object recognition
 * 
 * In production, this would integrate with:
 * - Google Vision API
 * - AWS Rekognition
 * - Microsoft Computer Vision
 * - TensorFlow.js with a trained model
 * - Custom ML backend
 */
export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  if (!imageDataUrl) {
    return {
      success: false,
      error: 'No image data provided'
    };
  }

  try {
    // Call Pip System Backend
    const response = await fetch('http://localhost:8000/api/discovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child_id: "demo_child_123", // Fixed ID for prototype
        media_type: "image",
        media_data: imageDataUrl, // Full data URL
        discovery_description: "I found this!", // Default description
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error("Backend response not OK:", response.status, response.statusText);
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Backend Data Received:", data);

    // Transform backend response to Discovery object
    const discovery: Discovery = {
      id: `discovery-${Date.now()}`,
      name: data.identification?.name || "Mystery Object",
      scientificName: data.identification?.scientific_name,
      category: data.identification?.name ? "nature" : "unknown",
      type: "flora", // Fixed: Matches 'flora' | 'fauna' type definition
      color: "green",
      habitat: "garden",
      isDangerous: data.safety_status === "danger" || data.safety_status === "caution",
      story: data.story?.story || data.story || "No story available.", // Handle nested story object if necessary
      funFact: data.identification?.facts ? data.identification.facts[0] : "It's amazing!",
      imageUrl: imageDataUrl,
      discoveredAt: new Date(),
      // Add extra fields if Discovery type supports them, otherwise they are ignored
    };

    console.log("Mapped Discovery Object:", discovery);

    return {
      success: true,
      discovery
    };

  } catch (error) {
    console.error('Error recognizing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Processes multiple images in sequence (for live discovery mode)
 */
export async function recognizeImageBatch(imageDataUrls: string[]): Promise<RecognitionResult[]> {
  return Promise.all(imageDataUrls.map(url => recognizeImage(url)));
}

/**
 * Validates if an image is usable for recognition
 */
export function validateCapturedImage(imageDataUrl: string): { valid: boolean; error?: string } {
  if (!imageDataUrl) {
    return { valid: false, error: 'No image captured' };
  }

  if (!imageDataUrl.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format' };
  }

  // Check rough minimum size (at least 50KB of data)
  if (imageDataUrl.length < 50000) {
    return { valid: false, error: 'Image is too small or blurry' };
  }

  return { valid: true };
}

/**
 * Adapts the story based on child's age
 */
export function adaptStoryForAge(story: string, age: number): string {
  if (age <= 5) {
    // Simplify for younger children
    return story.replace(/super-strong/g, 'very strong')
      .replace(/magnificent/g, 'beautiful')
      .replace(/resilient/g, 'tough')
      .replace(/ecosystem/g, 'nature home');
  } else if (age >= 10) {
    // Add more scientific detail for older children
    return story;
  }

  return story;
}

/**
 * Example integration template for setting up a real ML service
 */
export const ML_SERVICE_SETUP = `
// Example: Using Google Vision API

import { Vision } from '@google-cloud/vision';

const client = new Vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export async function recognizeImageWithGoogle(imageDataUrl: string) {
  const base64Image = imageDataUrl.split(',')[1];
  
  const request = {
    image: { content: base64Image },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'SAFE_SEARCH_DETECTION' }
    ]
  };

  const [result] = await client.annotateImage(request);
  // Process results...
}
`;
