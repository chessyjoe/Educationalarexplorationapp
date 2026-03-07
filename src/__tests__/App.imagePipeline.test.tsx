/**
 * Integration test for the image pipeline through App.tsx
 *
 * Verifies that:
 *  1. When the camera fires onCapture(imageDataUrl), App calls recognizeImage().
 *  2. On a successful result, App transitions to the ResultScreen.
 *  3. The ResultScreen displays the discovery name returned by the backend.
 *
 * Heavy UI dependencies (Firebase, react-router, etc.) are mocked at the module
 * level so the test stays fast and deterministic.
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from '@/app/App';
import type { Discovery, RecognitionResult } from '@/app/types';

// ─── Module mocks ─────────────────────────────────────────────────────────────

// motion/react — passthrough without animations
vi.mock('motion/react', () => ({
    motion: new Proxy(
        {},
        {
            get: (_t, tag) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ({ children, ...rest }: any) =>
                    React.createElement(tag as string, rest, children),
        }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Firebase auth — return a stable reference so we don't cause infinite re-renders in useEffect
const testUser = { uid: 'test-user-1', displayName: 'Test Kid', email: 'test@test.com' };
const testSignOut = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        user: testUser,
        signOut: testSignOut,
    }),
}));

// Skip rendering the real camera hardware
vi.mock('@/app/components/CameraInterface', () => ({
    CameraInterface: ({
        onCapture,
        isProcessing,
    }: {
        onCapture: (url: string) => void;
        isProcessing: boolean;
    }) => (
        <div data-testid="camera-interface">
            <button
                onClick={() => onCapture('data:image/jpeg;base64,' + 'A'.repeat(12_000))}
                disabled={isProcessing}
            >
                Capture
            </button>
        </div>
    ),
}));

// Mock the recognition service — controls what the "backend" returns
vi.mock('@/app/services/recognitionService', () => ({
    recognizeImage: vi.fn(),
    validateCapturedImage: vi.fn().mockReturnValue({ valid: true }),
}));

// Sonner toaster — no-op in tests
vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
    Toaster: () => null,
}));

// PWAInstallPrompt — no side-effects needed
vi.mock('@/app/components/PWAInstallPrompt', () => ({
    PWAInstallPrompt: () => null,
}));

// UserProfileButton — no Firebase needed
vi.mock('@/components/user/UserProfileButton', () => ({
    UserProfileButton: () => null,
}));

// AuthModal
vi.mock('@/components/auth/AuthModal', () => ({
    AuthModal: () => null,
}));

// ─── Test data ────────────────────────────────────────────────────────────────

import { recognizeImage } from '@/app/services/recognitionService';

const MOCK_DISCOVERY: Discovery = {
    id: 'disc_test_001',
    name: 'Red Admiral Butterfly',
    scientificName: 'Vanessa atalanta',
    type: 'fauna',
    category: 'insect',
    color: 'red',
    habitat: 'gardens',
    isDangerous: false,
    story: 'The Red Admiral is a striking visitor to gardens everywhere.',
    funFact: 'Its caterpillars feed on nettles.',
    imageUrl: 'data:image/jpeg;base64,ABCDEF',
    discoveredAt: new Date(),
};

const SUCCESS_RESULT: RecognitionResult = {
    success: true,
    discovery: MOCK_DISCOVERY,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

beforeAll(() => {
    // jsdom stubs for speech synthesis
    Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: vi.fn() },
        writable: true,
    });
    (window as any).SpeechSynthesisUtterance = vi.fn();

    // stub localStorage so App's storage utils don't break
    const store: Record<string, string> = {
        // Pre-fill onboarding so App goes straight to 'welcome' for uid=test-user-1
        'pocket_science_onboarding_complete_test-user-1': 'true',
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        (key: string, value: string) => { store[key] = value; }
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
        (key: string) => { delete store[key]; }
    );
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('App — image capture pipeline', () => {
    it('transitions to ResultScreen after a successful capture', async () => {
        vi.mocked(recognizeImage).mockResolvedValue(SUCCESS_RESULT);

        render(<App />);

        // App with a logged-in user who completed onboarding → welcome screen
        // Simulate navigating to camera (click the explore button)
        const exploreBtn = screen.queryByRole('button', { name: /start exploring/i });
        if (exploreBtn) {
            await act(async () => { exploreBtn.click(); });
        }

        // Fire the capture from the mocked CameraInterface
        const captureBtn = screen.queryByRole('button', { name: /capture/i });
        if (captureBtn) {
            await act(async () => { captureBtn.click(); });
        }

        // ResultScreen should now be visible with the discovery name
        expect(recognizeImage).toHaveBeenCalledOnce();
        // After processing the mock, App sets currentScreen='result' and renders ResultScreen
        expect(screen.getByText('Red Admiral Butterfly')).toBeInTheDocument();
    });

    it('passes the image data URL to recognizeImage()', async () => {
        vi.mocked(recognizeImage).mockResolvedValue(SUCCESS_RESULT);

        render(<App />);

        const exploreBtn = screen.queryByRole('button', { name: /start exploring/i });
        if (exploreBtn) await act(async () => { exploreBtn.click(); });

        const captureBtn = screen.queryByRole('button', { name: /capture/i });
        if (captureBtn) await act(async () => { captureBtn.click(); });

        // The image URL passed by our mock CameraInterface
        const expected = 'data:image/jpeg;base64,' + 'A'.repeat(12_000);
        expect(vi.mocked(recognizeImage)).toHaveBeenCalledWith(
            expected,
            'test-user-1',
            'Explorer',
            7
        );
    });

    it('shows an error toast (not ResultScreen) when backend returns failure', async () => {
        vi.mocked(recognizeImage).mockResolvedValue({
            success: false,
            error: 'Could not identify this object',
        });

        const { toast } = await import('sonner');

        render(<App />);

        const exploreBtn = screen.queryByRole('button', { name: /start exploring/i });
        if (exploreBtn) await act(async () => { exploreBtn.click(); });

        const captureBtn = screen.queryByRole('button', { name: /capture/i });
        if (captureBtn) await act(async () => { captureBtn.click(); });

        // ResultScreen should NOT be shown
        expect(screen.queryByText('Red Admiral Butterfly')).not.toBeInTheDocument();
        // An error toast should have fired
        expect(toast.error).toHaveBeenCalledWith(
            expect.stringMatching(/could not identify/i)
        );
    });
});
