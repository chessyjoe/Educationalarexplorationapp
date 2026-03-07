/**
 * Firebase Client Configuration
 * Initialize Firebase for frontend web application.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
    initializeAppCheck,
    ReCaptchaV3Provider,
    type AppCheck,
} from 'firebase/app-check';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
    const required = ['apiKey', 'authDomain', 'projectId'];
    const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

    if (missing.length > 0) {
        console.error('Missing Firebase configuration:', missing);
        throw new Error(
            `Missing required Firebase config: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all VITE_FIREBASE_* variables are set.'
        );
    }
};

// Validate before initializing
validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// ------------------------------------------------------------------ //
// Firebase App Check
// - Production: reCAPTCHA v3 (requires VITE_RECAPTCHA_SITE_KEY in .env)
// - Development: debug token (printed to console on first run)
// ------------------------------------------------------------------ //
let appCheck: AppCheck | null = null;

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (import.meta.env.PROD && recaptchaSiteKey) {
    // Production — use reCAPTCHA v3
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
    });
} else if (import.meta.env.DEV) {
    // Development — enable debug mode with a consistent explicit token so you don't have to keep adding new ones.
    // Make sure you add this token to the App Check debugging settings in Firebase Console!
    (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = '989129f4-cf78-43f5-9c99-3465ba025eb0';
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'), // Fallback test key if no site key in dev
        isTokenAutoRefreshEnabled: true,
    });
}

export { appCheck };
export default app;
