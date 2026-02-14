# Pocket Science - Progressive Web Application (PWA) Guide

## Overview

Pocket Science is now a fully-functional Progressive Web Application (PWA). This means:

✅ **Installable** - Install directly on your home screen like a native app  
✅ **Offline Support** - Works without internet connection (with cached data)  
✅ **Mobile Optimized** - Responsive design for all screen sizes  
✅ **App-like Experience** - Full-screen, no browser UI  
✅ **Fast Loading** - Service worker caches assets for instant loads  

## Installation on Mobile Devices

### iOS (iPhone/iPad)

1. Open Safari and navigate to the app URL
2. Tap the **Share** button (bottom right)
3. Scroll down and tap **"Add to Home Screen"**
4. Enter a name (e.g., "Pocket Science")
5. Tap **"Add"**

The app will now appear on your home screen as an icon and launch full-screen when tapped.

### Android

#### Chrome Browser:
1. Open Chrome and navigate to the app URL
2. Tap the **menu** button (⋮) in the top right
3. Select **"Install app"** or **"Add to Home Screen"**
4. Confirm the installation

#### Firefox Browser:
1. Open Firefox and navigate to the app URL
2. Tap the **menu** button (☰) in the top right
3. Select **"Install"** or **"Add to home screen"**
4. Confirm the installation

Once installed, the app will launch in standalone mode without browser UI, providing a native app experience.

## Features

### Offline Support
- The app caches essential assets on first visit
- Core functionality works offline (reading saved discoveries, accessing collection)
- Network requests are cached for quick subsequent loads
- When online, app automatically syncs and updates

### Service Worker
- Automatically registers on first visit
- Caches static assets for instant loading
- Implements smart caching strategy:
  - Static assets: Cache-first (fast offline support)
  - API requests: Network-first with cache fallback
  - HTML pages: Network-first with fallback to cached version

### App Updates
- Service worker checks for updates every 6 hours
- Automatically fetches latest version in background
- Prompts user to reload when update is available
- Seamless update experience without disrupting user

## PWA Configuration Files

### `manifest.json`
Defines app metadata:
- App name, icon, colors, orientation
- Shortcuts for quick actions (Start Exploring, View Collection)
- Screenshot previews

### `public/sw.js`
Service worker handles:
- Asset caching strategies
- Offline fallbacks
- Cache management
- Background sync (when implemented)

### Meta Tags in `index.html`
- Apple-specific meta tags for iOS
- Theme colors for browser UI
- Manifest and service worker links

## Mobile Optimizations

The app is fully responsive and optimized for mobile devices:

- **Portrait orientation** - Locked for primary viewing mode
- **Safe area handling** - Works with notches and rounded corners
- **Touch-optimized UI** - Large buttons for easy interaction
- **Fast animations** - Smooth 60fps experience
- **Battery efficient** - Minimal background activity

## Capabilities

### Camera Access
- iOS: Prompts permission on first use
- Android: Permissions defined in manifest

### Photo Library
- Access to device photo library for image upload
- Offline image processing with cached models

### Storage
- LocalStorage for user data and settings
- Automatic syncing when online
- No external server dependency for basic features

## Deployment

The PWA is ready to deploy to any static hosting platform:

### Build for Production
```bash
npm run build
```

The `dist/` folder contains all files needed for deployment.

### Deploy to Popular Platforms

**Netlify:**
```bash
netlify deploy --prod --dir dist
```

**Vercel:**
```bash
vercel --prod
```

**GitHub Pages:**
```bash
npm run build
# Push dist folder to gh-pages branch
```

## Testing PWA Features

### Test Offline Mode
1. Install the app
2. Go to DevTools (Chrome: F12)
3. Open Application → Service Workers
4. Check "Offline"
5. Navigate the app - should work offline

### Test Installation
1. On mobile, open in browser
2. Look for install prompt
3. Install to home screen
4. App launches in standalone mode

### Test Updates
1. Deploy new version
2. Visit app in browser
3. Service worker automatically checks for updates
4. Next reload gets latest version

## Browser Support

| Browser | iOS | Android |
|---------|-----|---------|
| Safari | ✅ (iOS 11.3+) | N/A |
| Chrome | ✅ | ✅ |
| Firefox | ⚠️ (Limited) | ✅ |
| Edge | ✅ | ✅ |
| Samsung Internet | N/A | ✅ |

## Troubleshooting

### App Won't Install
- Ensure HTTPS is enabled (required for PWA)
- Clear browser cache and try again
- Check manifest.json is valid (use validation tools)
- Try in a different browser

### Offline Features Not Working
- Check Service Worker registration in DevTools
- Verify service worker is active and not pending
- Clear service worker cache and reinstall

### Updates Not Appearing
- Service worker checks every 6 hours
- Force update by uninstalling and reinstalling app
- Clear browser cache and service worker cache

## Future Enhancements

Potential PWA improvements:
- Background sync for photo uploads
- Push notifications for achievements
- Periodic sync for badge updates
- Sharing discoveries via Web Share API
- Widget support on Android

## Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Manifest Validator](https://manifest-validator.appspot.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
