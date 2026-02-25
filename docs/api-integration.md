# API Integration Guide

## Overview

This app uses the **FastAPI backend** (`localhost:8000`) as its primary recognition engine. The backend uses Google Gemini AI to identify species, assess safety, and generate stories from camera captures.

---

## Primary Integration — FastAPI Backend (Current Implementation)

This is what the app uses in production. The frontend sends a base64-encoded image to the backend, which runs the full multi-agent AI pipeline.

### Request Format

`POST http://localhost:8000/api/discovery`

```json
{
  "child_id": "demo_child_123",
  "media_type": "image",
  "media_data": "<base64_image_string>",
  "discovery_description": "I found this!",
  "timestamp": "2026-02-25T14:00:00.000Z"
}
```

### Response Format

```json
{
  "identification": {
    "name": "Monarch Butterfly",
    "scientific_name": "Danaus plexippus",
    "facts": ["Can migrate up to 3,000 miles!", "..."]
  },
  "safety_status": "safe",
  "story": "Once upon a time, a tiny orange butterfly...",
  "activities": ["Draw the butterfly", "Look for milkweed plants"],
  "saved": true,
  "discovery_id": "disc_abc123..."
}
```

### Frontend Service Integration

Edit `src/app/services/recognitionService.ts`:

```typescript
export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  const base64Image = imageDataUrl.split(',')[1];

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/discovery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: "demo_child_123",
      media_type: "image",
      media_data: base64Image,
      discovery_description: "I found this!",
      timestamp: new Date().toISOString()
    })
  });

  const data = await response.json();

  const discovery: Discovery = {
    id: `discovery-${Date.now()}`,
    name: data.identification?.name || "Mystery Object",
    scientificName: data.identification?.scientific_name,
    category: "nature",
    type: data.identification?.type || "plant",
    color: "natural",
    habitat: "varied",
    isDangerous: data.safety_status === "danger" || data.safety_status === "caution",
    story: data.story,
    funFact: data.identification?.facts?.[0] || "It's amazing!",
    imageUrl: imageDataUrl,
    discoveredAt: new Date()
  };

  return { success: true, discovery };
}
```

### Environment Variable

In your frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## Alternative Integrations

The options below are available if you want to replace the backend with a cloud image recognition service directly from the frontend.

### Google Cloud Vision API

**Best for:** High accuracy, multiple features

**Setup:**
1. Enable the Cloud Vision API in [Google Cloud Console](https://console.cloud.google.com)
2. Create an API key under APIs & Services → Credentials
3. Add to `.env.local`: `VITE_GOOGLE_VISION_API_KEY=your_key`

```typescript
export async function recognizeImage(imageDataUrl: string): Promise<RecognitionResult> {
  const base64Image = imageDataUrl.split(',')[1];
  const API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

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
  // Transform response to Discovery...
}
```

**Cost:** 1,000 requests/month free, then $1.50 per 1,000

---

### AWS Rekognition

**Best for:** Scalability, custom label training

```bash
npm install @aws-sdk/client-rekognition
```

```
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret
```

**Cost:** $1.00 per 1,000 images (no free tier)

---

### TensorFlow.js (Offline / Browser-Based)

**Best for:** Privacy, no server dependency

```bash
npm install @tensorflow/tfjs @tensorflow-models/coco-ssd
```

**Cost:** Free (runs in-browser)

---

## Common Issues

### "CORS Error"
- The FastAPI backend has CORS enabled for `*` in development
- For production, update `allow_origins` in `backend/app/main.py` to your domain

### "API Key not configured"
- Ensure `.env` file exists in root directory
- Restart dev server after adding env vars: `npm run dev`

### "Image is blank/black"
- Camera may not have permission — check browser permissions
- Try different lighting or get closer to the object

---

## Debugging

1. Open DevTools → **Network** tab
2. Take a photo
3. Find the `POST /api/discovery` request
4. Check the **Response** tab to verify the AI is responding

Check browser console for detailed error logs from the recognition service.
