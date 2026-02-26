/**
 * Firebase Client Configuration
 * Initialize Firebase for frontend web application.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
    initializeAppCheck,
    ReCaptchaV3Provider,
    CustomProvider,
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
    // Development — enable debug mode (token printed to console)
    // Add the printed token to Firebase Console → App Check → Apps → Manage debug tokens
    (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    appCheck = initializeAppCheck(app, {
        provider: new CustomProvider({
            getToken: async () => ({
                token: 'debug-token',
                expireTimeMillis: Date.now() + 3_600_000,
            }),
        }),
        isTokenAutoRefreshEnabled: false,
    });
}

export { appCheck };
export default app;
