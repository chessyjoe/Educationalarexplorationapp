import { useEffect } from 'react';

export function usePWAUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for service worker updates every 6 hours
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update();
          }
        });
      }, 6 * 60 * 60 * 1000);

      // Listen for service worker controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          // Reload the page to get the new service worker version
          window.location.reload();
        }
      });

      return () => clearInterval(interval);
    }
  }, []);
}
