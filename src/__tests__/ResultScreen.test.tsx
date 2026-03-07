/**
 * Tests for ResultScreen.tsx
 *
 * Verifies that:
 *  1. Discovery name, story, and fun fact received as props are rendered.
 *  2. The captured image is shown in the image element.
 *  3. Danger mode renders the warning UI.
 *  4. CTA buttons invoke their callback props.
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultScreen } from '@/app/components/ResultScreen';
import type { Discovery } from '@/app/types';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// motion/react uses animations that don't work in jsdom - provide a passthrough
vi.mock('motion/react', () => ({
    motion: new Proxy(
        {},
        {
            get: (_target, tag) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ({ children, ...rest }: any) =>
                    React.createElement(tag as string, rest, children),
        }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// SpeechSynthesis is not in jsdom
beforeAll(() => {
    Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: vi.fn() },
        writable: true,
    });
    (window as any).SpeechSynthesisUtterance = vi.fn();
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_DISCOVERY: Discovery = {
    id: 'test-1',
    name: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    type: 'fauna',
    category: 'insect',
    color: 'orange',
    habitat: 'meadows',
    isDangerous: false,
    story: 'The Monarch Butterfly travels thousands of miles each year.',
    funFact: 'It lays eggs only on milkweed plants.',
    imageUrl: 'http://example.com/butterfly.jpg',
    capturedImage: 'data:image/jpeg;base64,FAKECAPTUREDIMAGE',
    discoveredAt: new Date('2024-01-01'),
    followUpActivity: 'Draw a butterfly lifecycle diagram!',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ResultScreen — safe discovery', () => {
    it('renders the discovery name', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText('Monarch Butterfly')).toBeInTheDocument();
    });

    it('renders the scientific name', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText('Danaus plexippus')).toBeInTheDocument();
    });

    it('renders the discovery story text', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(
            screen.getByText(/travels thousands of miles/i)
        ).toBeInTheDocument();
    });

    it('renders the fun fact', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText(/lays eggs only on milkweed/i)).toBeInTheDocument();
    });

    it('renders the follow-up activity', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText(/draw a butterfly lifecycle/i)).toBeInTheDocument();
    });

    it('displays the captured image (img src = capturedImage)', () => {
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        const img = screen.getByRole('img', { name: /monarch butterfly/i });
        expect(img).toHaveAttribute('src', BASE_DISCOVERY.capturedImage);
    });

    it('calls onTryAgain when "Find More" is clicked', () => {
        const onTryAgain = vi.fn();
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={onTryAgain}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /find more/i }));
        expect(onTryAgain).toHaveBeenCalledOnce();
    });

    it('calls onAddToBoard when "Add to My Board" is clicked', () => {
        const onAddToBoard = vi.fn();
        render(
            <ResultScreen
                discovery={BASE_DISCOVERY}
                onAddToBoard={onAddToBoard}
                onTryAgain={vi.fn()}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /add to my board/i }));
        expect(onAddToBoard).toHaveBeenCalledOnce();
    });
});

describe('ResultScreen — dangerous discovery', () => {
    const DANGEROUS_DISCOVERY: Discovery = {
        ...BASE_DISCOVERY,
        isDangerous: true,
        name: 'Giant Hogweed',
    };

    it('shows the STOP warning header', () => {
        render(
            <ResultScreen
                discovery={DANGEROUS_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText(/stop!/i)).toBeInTheDocument();
        expect(screen.getByText(/do not touch/i)).toBeInTheDocument();
    });

    it('renders the dangerous discovery name', () => {
        render(
            <ResultScreen
                discovery={DANGEROUS_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={vi.fn()}
            />
        );
        expect(screen.getByText('Giant Hogweed')).toBeInTheDocument();
    });

    it('"Find Something Else" button calls onTryAgain', () => {
        const onTryAgain = vi.fn();
        render(
            <ResultScreen
                discovery={DANGEROUS_DISCOVERY}
                onAddToBoard={vi.fn()}
                onTryAgain={onTryAgain}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /find something else/i }));
        expect(onTryAgain).toHaveBeenCalledOnce();
    });
});
