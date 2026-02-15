# API Integration Guide - Image Recognition

This guide explains how to set up real image recognition for the Pocket Science app.

## Overview

The camera is now fully functional and captures real images. However, to identify objects in those images, you need to integrate with an image recognition API.

## Recommended Services

### 1. Google Cloud Vision API (Recommended)
**Best for:** Accuracy and multiple features

#### Setup Steps:

1. **Create a Google Cloud Project**
   ```bash
   # Visit https://console.cloud.google.com
   # Create a new project called "pocket-science"
   ```

2. **Enable Vision API**
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

4. **Set Environment Variable**
   ```bash
   # Create .env.local in project root
   VITE_GOOGLE_VISION_API_KEY=your_api_key_here
   ```

5. **Update Recognition Service**

Edit `src/app/services/recognitionService.ts`:

```typescript
import type { Discovery, RecognitionResult } from '@/app/types';

const API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

async function createDiscoveryFromGoogleResponse(data: any): Promise<Discovery> {
  // Transform Google Vision response to Discovery object
  const labels = data.responses[0].labelAnnotations || [];
  const webDetection = data.responses[0].webDetection || {};
  
  const topLabel = labels[0];
  
  return {
    id: `discovery-${Date.now()}`,
    name: topLabel.description,
    scientificName: webDetection.besMatch?.url ? extractScientificName(webDetection.bestMatches) : undefined,
    type: classifyType(topLabel.description),
    category: topLabel.description.toLowerCase(),
    color: 'natural',
    habitat: 'varied',
    isDangerous: await checkDanger(topLabel.description),
    story: await generateStory(topLabel.description),
    funFact: await generateFunFact(topLabel.description),
    imageUrl: '', // Use captured image instead
    discoveredAt: new Date()
  };
}

export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  if (!imageDataUrl) {
    return {
      success: false,
      error: 'No image data provided'
    };
  }

  if (!API_KEY) {
    return {
      success: false,
      error: 'Image recognition API not configured. Please add VITE_GOOGLE_VISION_API_KEY to .env.local'
    };
  }

  try {
    const base64Image = imageDataUrl.split(',')[1];
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'WEB_DETECTION' },
              { type: 'SAFE_SEARCH_DETECTION' }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: `API Error: ${data.error.message}`
      };
    }

    // Check if image is blocked (safe search)
    const safeSearch = data.responses[0].safeSearchAnnotation;
    if (safeSearch?.violent === 'LIKELY' || safeSearch?.violence === 'VERY_LIKELY') {
      return {
        success: false,
        isDangerous: true,
        error: 'Image contains restricted content'
      };
    }

    const discovery = await createDiscoveryFromGoogleResponse(data);

    return {
      success: true,
      discovery
    };
  } catch (error) {
    console.error('Recognition error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### 2. AWS Rekognition

**Best for:** Custom labels and scalability

#### Setup Steps:

1. **Create AWS Account**
   - Visit https://aws.amazon.com/

2. **Configure AWS Credentials**
   ```bash
   npm install @aws-sdk/client-rekognition
   ```

3. **Set Environment Variables**
   ```
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=your_key
   VITE_AWS_SECRET_ACCESS_KEY=your_secret
   ```

4. **Update Recognition Service**
   ```typescript
   import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
   
   const client = new RekognitionClient({ region: import.meta.env.VITE_AWS_REGION });
   
   export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
     const base64Image = imageDataUrl.split(',')[1];
     const bytes = Buffer.from(base64Image, 'base64');
     
     const command = new DetectLabelsCommand({
       Image: { Bytes: bytes },
       MaxLabels: 10,
       MinConfidence: 70
     });
     
     const response = await client.send(command);
     // Transform response...
   }
   ```

### 3. TensorFlow.js (Browser-Based)

**Best for:** Privacy, no server needed

#### Setup Steps:

1. **Install Dependencies**
   ```bash
   npm install @tensorflow/tfjs @tensorflow-models/coco-ssd
   ```

2. **Update Recognition Service**
   ```typescript
   import * as tf from '@tensorflow/tfjs';
   import * as cocoSsd from '@tensorflow-models/coco-ssd';

   export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
     const img = new Image();
     img.src = imageDataUrl;
     
     await new Promise(resolve => img.onload = resolve);
     
     const model = await cocoSsd.load();
     const predictions = await model.estimateObjects(img);
     
     // Transform predictions to Discovery...
   }
   ```

### 4. Custom ML Backend

If you have your own ML service:

```typescript
export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  const base64Image = imageDataUrl.split(',')[1];
  
    const response = await fetch('http://localhost:8000/api/discovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      child_id: "demo_child_123", // Fixed ID for prototype
      media_type: "image",
      media_data: base64Image,
      discovery_description: "I found this!", // Default description if none provided
      timestamp: new Date().toISOString()
    })
  });

  const data = await response.json();
  
  // Transform response to Discovery object
  // The backend returns a specific format, we need to map it to the frontend Discovery type
  const discovery: Discovery = {
    id: `discovery-${Date.now()}`,
    name: data.identification?.name || "Mystery Object",
    scientificName: data.identification?.scientific_name,
    category: data.identification?.name ? "nature" : "unknown", // Simple mapping
    type: "plant", // Hardcoded default, should map from backend
    color: "green",
    habitat: "garden",
    isDangerous: data.safety_status === "danger" || data.safety_status === "caution",
    story: data.story,
    funFact: data.identification?.facts ? data.identification.facts[0] : "It's amazing!",
    imageUrl: imageDataUrl,
    discoveredAt: new Date()
  };

  return {
    success: true,
    discovery
  };
}
```

## Environment Variables

Create a `.env.local` file in the project root:

```
# Google Vision API
VITE_GOOGLE_VISION_API_KEY=your_key_here

# AWS Rekognition
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret

# Custom Backend
VITE_ML_API_KEY=your_key_here
VITE_ML_API_ENDPOINT=https://your-service.com/api
```

**Important:** Never commit `.env.local` to git. Add it to `.gitignore`.

## Testing Your Integration

1. **Test Camera Access**
   - Open the app and navigate to Camera
   - Verify video is streaming from your device's camera
   - You should see the focus circle overlay

2. **Test Image Capture**
   - Point at an object
   - Tap the capture button
   - A snapshot should be captured

3. **Test Recognition**
   - After capturing, the app will send to your API
   - You should see results displayed (or error message)
   - Check browser console for API responses

4. **Debug API Calls**
   - Open DevTools (F12)
   - Go to Network tab
   - Take a photo - you'll see the API request
   - Check the Response to verify API is working

## Common Issues

### "API Key not configured"
- Ensure `.env.local` file exists
- Verify environment variable name matches your setup
- Restart dev server after adding env vars: `npm run dev`

### "CORS Error"
- Your API must support CORS headers
- For Google Vision API, CORS is handled automatically
- For custom backends, add CORS headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: POST
  ```

### "Image is blank/black"
- Camera may not have permission
- Check browser permissions settings
- Try different camera orientation
- Test with different lighting

### "Object not recognized"
- Some objects may be hard to recognize
- Ensure good lighting
- Get closer to the object
- Try different ML service if one fails

## Monitoring and Analytics

Add logging to track recognition:

```typescript
export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  const startTime = Date.now();
  
  try {
    // ... API call ...
    
    const duration = Date.now() - startTime;
    console.log(`Recognition took ${duration}ms`);
    console.log('Result:', result);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'object_recognized', {
        object_name: discovery.name,
        duration: duration
      });
    }
    
    return result;
  } catch (error) {
    console.error('Recognition failed:', error);
    if (window.gtag) {
      window.gtag('event', 'recognition_error', {
        error: error.message
      });
    }
    throw error;
  }
}
```

## Cost Estimation

| Service | Free Tier | Pricing |
|---------|-----------|---------|
| Google Vision | 1,000 requests/month | $1.50 per 1,000 requests |
| AWS Rekognition | No free tier | $1.00 per 1,000 images |
| TensorFlow.js | Free (browser) | N/A |
| Custom Backend | Depends | Depends |

## Next Steps

1. Choose a service based on your needs and budget
2. Set up API credentials
3. Update `recognitionService.ts` with your integration
4. Test camera capture and recognition
5. Deploy to production

## Support

For help with specific services:
- [Google Vision API Docs](https://cloud.google.com/vision/docs)
- [AWS Rekognition Docs](https://docs.aws.amazon.com/rekognition/)
- [TensorFlow.js Docs](https://www.tensorflow.org/js)

Good luck! 🎉
