/**
 * Tests for cameraService.ts
 *
 * Verifies that:
 *  1. captureFrame() draws the video onto a canvas and returns a JPEG data URL.
 *  2. validateCapturedImage() rejects bad inputs and accepts valid ones.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureFrame } from '@/app/services/cameraService';

// recognitionService imports discoveryAPI — mock it so the module loads cleanly
vi.mock('@/services/apiService', () => ({
    discoveryAPI: { create: vi.fn() },
}));

import { validateCapturedImage } from '@/app/services/recognitionService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A minimal valid JPEG data URL (>10 KB of padding so size check passes). */
function makeFakeJpegDataUrl(size = 12_000): string {
    return 'data:image/jpeg;base64,' + 'A'.repeat(size);
}

// ─── captureFrame() ───────────────────────────────────────────────────────────

describe('captureFrame()', () => {
    beforeEach(() => {
        /**
         * jsdom does not implement HTMLCanvasElement.toDataURL.
         * We mock the whole canvas API so the function can run without a real browser.
         */
        const fakeDataUrl = makeFakeJpegDataUrl();
        const fakeCtx = {
            drawImage: vi.fn(),
            scale: vi.fn(),
        };

        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: vi.fn().mockReturnValue(fakeCtx),
                    toDataURL: vi.fn().mockReturnValue(fakeDataUrl),
                } as unknown as HTMLCanvasElement;
            }
            // fall through for any other element
            return document.createElement(tag);
        });
    });

    it('returns a data URL starting with "data:image/"', () => {
        const fakeVideo = {} as HTMLVideoElement;
        const result = captureFrame(fakeVideo, 1280, 960);
        expect(result).toMatch(/^data:image\//);
    });

    it('calls drawImage on the canvas context', () => {
        const drawImageSpy = vi.fn();
        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: vi.fn().mockReturnValue({ drawImage: drawImageSpy, scale: vi.fn() }),
                    toDataURL: vi.fn().mockReturnValue(makeFakeJpegDataUrl()),
                } as unknown as HTMLCanvasElement;
            }
            return document.createElement(tag);
        });

        const fakeVideo = {} as HTMLVideoElement;
        captureFrame(fakeVideo, 640, 480);
        expect(drawImageSpy).toHaveBeenCalledWith(fakeVideo, 0, 0, 640, 480);
    });
});

// ─── validateCapturedImage() ──────────────────────────────────────────────────

describe('validateCapturedImage()', () => {
    it('rejects an empty string', () => {
        const result = validateCapturedImage('');
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/no image/i);
    });

    it('rejects a non-image data URL', () => {
        const result = validateCapturedImage('data:application/pdf;base64,AAAA');
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/invalid image format/i);
    });

    it('rejects an image that is too small (<10 KB)', () => {
        const tinyImg = 'data:image/jpeg;base64,' + 'A'.repeat(1000);
        const result = validateCapturedImage(tinyImg);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/capture failed/i);
    });

    it('accepts a realistically-sized JPEG data URL', () => {
        const validImg = makeFakeJpegDataUrl(12_000);
        const result = validateCapturedImage(validImg);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });
});
