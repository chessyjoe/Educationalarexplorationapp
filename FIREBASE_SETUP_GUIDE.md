# Firebase Frontend Integration Guide

## Overview
This guide will help you configure Firebase for the frontend to enable authentication and discovery persistence.

## Prerequisites
✅ Backend Firebase integration complete  
✅ Firebase project created in Firebase Console  
✅ Firebase web app added to project

## Steps to Complete Integration

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app (or create one if you haven't)
6. Copy the `firebaseConfig` object values

### 2. Create Frontend .env File

Create a file named `.env` in the **root** of the project (same level as `package.json`):

```env
# Firebase Configuration for Frontend
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000
```

Replace the placeholder values with your actual Firebase config values from step 1.

### 3. Restart Development Server

After creating the `.env` file, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing the Integration

### 1. Test Authentication

1. Open the app in your browser
2. Click the "Sign In" button
3. Try creating an account with email/password
4. Or try "Continue with Google"
5. Check that your profile appears after signin

### 2. Test Discovery Persistence

1. While signed in, create a new discovery
2. Check the response - it should have `"saved": true`
3. Navigate to the discovery history page
4. Verify your discovery appears in the list

### 3. Verify in Firebase Console

1. Go to Firebase Console → Authentication
2. Check that your user appears in the Users tab
3. Go to Firestore Database
4. Verify collections `users` and `discoveries` exist
5. Check that your data is being saved

## Architecture Overview

```
Frontend (React + Vite)
├── AuthContext - Manages user auth state
├── Firebase Config - Initializes Firebase SDK
├── API Service - Handles backend requests with auth
└── Components
    ├── AuthModal - Login/signup UI
    ├── UserProfileButton - User menu
    └── DiscoveryHistory - Shows saved discoveries

Backend (FastAPI)
├── Firebase Admin - Server-side Firebase
├── Auth Middleware - Verifies tokens
├── Repositories - Data access layer
└── API Endpoints - Protected routes
```

## Features Now Available

✅ **Email/Password Authentication**  
✅ **Google Sign-In**  
✅ **Auto-save Discoveries** (when logged in)  
✅ **Discovery History** with pagination  
✅ **Favorite Discoveries**  
✅ **User Profiles** with child accounts  
✅ **Secure API** with token verification

## Troubleshooting

### "Missing Firebase configuration" Error
→ Make sure `.env` file exists in root directory  
→ Verify all `VITE_FIREBASE_*` variables are set  
→ Restart dev server after creating `.env`

### "Cannot find module 'firebase/app'" Error
→ Run `npm install firebase`  
→ Check that firebase is in `node_modules`

### Authentication Fails
→ Check Firebase Console → Authentication → Sign-in methods  
→ Ensure Email/Password and Google are enabled  
→ Verify `.env` values match Firebase Console

### Discoveries Not Saving
→ Sign in first (discoveries only save for authenticated users)  
→ Check backend console for errors  
→ Verify `firebase-service-account.json` exists in backend directory  
→ Check Firestore security rules allow authenticated writes

## Next Steps

1. **Customize UI**: Update colors, logos, and styling
2. **Add Child Profiles**: Let users add multiple children
3. **Memory System**: Implement long-term memory persistence
4. **Image Upload**: Add Firebase Storage for discovery images
5. **Notifications**: Set up Firebase Cloud Messaging

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the backend terminal for API errors
3. Verify Firebase Console shows your auth/data
4. Review the [Firebase Documentation](https://firebase.google.com/docs)
