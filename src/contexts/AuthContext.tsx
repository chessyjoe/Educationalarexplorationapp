/**
 * Authentication Context
 * Provides authentication state and methods throughout the application.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
            setLoading(false);

            if (user) {
                console.log('User authenticated:', user.uid);
            } else {
                console.log('User signed out');
            }
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error('Sign in error:', err);
            setError(getErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            setError(null);
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name if provided
            if (displayName && result.user) {
                await updateProfile(result.user, { displayName });
            }
        } catch (err: any) {
            console.error('Sign up error:', err);
            setError(getErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error('Google sign in error:', err);
            setError(getErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err: any) {
            console.error('Logout error:', err);
            setError('Failed to log out. Please try again.');
            throw err;
        }
    };

    // Get current user's ID token
    const getIdToken = async (): Promise<string | null> => {
        if (!user) return null;

        try {
            const token = await user.getIdToken();
            return token;
        } catch (err) {
            console.error('Error getting ID token:', err);
            return null;
        }
    };

    // Clear error message
    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        getIdToken,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed before completing the sign in.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled.';
        default:
            return 'An error occurred. Please try again.';
    }
}
