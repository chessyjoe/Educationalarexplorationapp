import type { Discovery, RecognitionResult } from '@/app/types';
import { discoveryAPI } from '@/services/apiService';

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
    // Call Pip System Backend via API Service (authenticated)
    // save=true is default
    const data = await discoveryAPI.create({
      child_id: "demo_child_123", // TODO: Get from context if needed
      media_type: "image",
      media_data: imageDataUrl,
      discovery_description: "I found this!",
      timestamp: new Date().toISOString()
    });

    console.log("Backend Data Received:", data);
    return mapBackendResponseToResult(data, imageDataUrl);

  } catch (error) {
    console.error('Error recognizing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Analyzes an image without saving it to history (for Live Mode)
 */
export async function analyzeImage(imageDataUrl: string): Promise<RecognitionResult> {
  if (!imageDataUrl) return { success: false, error: 'No image' };

  try {
    // Call with save=false
    const data = await discoveryAPI.create({
      media_type: "image",
      media_data: imageDataUrl,
      timestamp: new Date().toISOString()
    }, false);

    return mapBackendResponseToResult(data, imageDataUrl);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { success: false, error: 'Analysis failed' };
  }
}

function mapBackendResponseToResult(data: any, imageDataUrl: string): RecognitionResult {
  // Transform backend response to Discovery object
  const discovery: Discovery = {
    id: data.discovery_id || `temp-${Date.now()}`,
    name: data.identification?.name || "Mystery Object",
    scientificName: data.identification?.scientific_name,
    category: data.identification?.name ? "nature" : "unknown",
    type: "flora", // Matches 'flora' | 'fauna' type definition
    color: "green",
    habitat: "garden",
    isDangerous: data.safety_status === "danger" || data.safety_status === "caution",
    story: typeof data.story === 'string' ? data.story : (data.story?.story || "No story available."),
    funFact: Array.isArray(data.identification?.facts) && data.identification.facts.length > 0
      ? data.identification.facts[0]
      : "It's amazing!",
    imageUrl: imageDataUrl,
    discoveredAt: new Date(),
    followUpActivity: data.activity?.prompt
  };

  return {
    success: true,
    discovery
  };
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

  // Check rough minimum size (at least 10KB of data — 640x480 JPEG produces ~30-45k chars)
  if (imageDataUrl.length < 10000) {
    return { valid: false, error: 'Image capture failed - please try again' };
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
