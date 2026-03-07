/**
 * Tests for recognitionService.ts
 *
 * Verifies that:
 *  1. recognizeImage() calls discoveryAPI.create() with the image data.
 *  2. The backend response is correctly mapped into a Discovery object.
 *  3. Error cases (empty image, API failure) are handled gracefully.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recognizeImage, analyzeImage } from '@/app/services/recognitionService';

// ─── Mock the API service ──────────────────────────────────────────────────────

vi.mock('@/services/apiService', () => ({
    discoveryAPI: {
        create: vi.fn(),
    },
}));

// Re-import after mocking so we get the mocked reference.
import { discoveryAPI } from '@/services/apiService';

// ─── Shared fixture ───────────────────────────────────────────────────────────

/** A realistic backend response from /api/discovery */
const BACKEND_RESPONSE = {
    discovery_id: 'disc_abc123',
    identification: {
        name: 'Monarch Butterfly',
        scientific_name: 'Danaus plexippus',
        facts: ['Migrates thousands of miles', 'Lays eggs only on milkweed'],
    },
    safety_status: 'safe',
    story: 'The Monarch Butterfly is a dazzling orange traveller of nature.',
    activity: {
        prompt: 'Draw what you saw and label its wings!',
    },
};

const FAKE_IMAGE_URL =
    'data:image/jpeg;base64,' + 'A'.repeat(12_000);

// ─── recognizeImage() ─────────────────────────────────────────────────────────

describe('recognizeImage()', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns { success: false } when called with an empty string', async () => {
        const result = await recognizeImage('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('No image data provided');
        // API should NOT have been called
        expect(discoveryAPI.create).not.toHaveBeenCalled();
    });

    it('calls discoveryAPI.create() with the image data URL and media_type "image"', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        await recognizeImage(FAKE_IMAGE_URL);

        expect(discoveryAPI.create).toHaveBeenCalledOnce();
        const [[payload]] = vi.mocked(discoveryAPI.create).mock.calls;
        expect(payload.media_data).toBe(FAKE_IMAGE_URL);
        expect(payload.media_type).toBe('image');
    });

    it('maps the backend response name → discovery.name', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.success).toBe(true);
        expect(result.discovery?.name).toBe('Monarch Butterfly');
    });

    it('maps scientific_name correctly', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.scientificName).toBe('Danaus plexippus');
    });

    it('maps the backend story to discovery.story', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.story).toBe(
            'The Monarch Butterfly is a dazzling orange traveller of nature.'
        );
    });

    it('sets the first fact as discovery.funFact', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.funFact).toBe('Migrates thousands of miles');
    });

    it('maps activity.prompt → discovery.followUpActivity', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.followUpActivity).toBe('Draw what you saw and label its wings!');
    });

    it('sets isDangerous=true when safety_status is "danger"', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue({
            ...BACKEND_RESPONSE,
            safety_status: 'danger',
        });

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.isDangerous).toBe(true);
    });

    it('sets isDangerous=true when safety_status is "caution"', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue({
            ...BACKEND_RESPONSE,
            safety_status: 'caution',
        });

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.isDangerous).toBe(true);
    });

    it('sets isDangerous=false when safety_status is "safe"', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue({
            ...BACKEND_RESPONSE,
            safety_status: 'safe',
        });

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.isDangerous).toBe(false);
    });

    it('stores the original imageUrl on the discovery object', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.discovery?.imageUrl).toBe(FAKE_IMAGE_URL);
    });

    it('returns { success: false } when discoveryAPI.create() throws', async () => {
        vi.mocked(discoveryAPI.create).mockRejectedValue(new Error('Network error'));

        const result = await recognizeImage(FAKE_IMAGE_URL);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Network error');
    });
});

// ─── analyzeImage() (live / no-save mode) ────────────────────────────────────

describe('analyzeImage()', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('calls discoveryAPI.create() with save=false', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        await analyzeImage(FAKE_IMAGE_URL);

        expect(discoveryAPI.create).toHaveBeenCalledOnce();
        // Second argument to create() should be false (save=false)
        const [, saveFlag] = vi.mocked(discoveryAPI.create).mock.calls[0];
        expect(saveFlag).toBe(false);
    });

    it('returns { success: false } for an empty image', async () => {
        const result = await analyzeImage('');
        expect(result.success).toBe(false);
    });

    it('maps the backend response the same way as recognizeImage()', async () => {
        vi.mocked(discoveryAPI.create).mockResolvedValue(BACKEND_RESPONSE);

        const result = await analyzeImage(FAKE_IMAGE_URL);

        expect(result.success).toBe(true);
        expect(result.discovery?.name).toBe('Monarch Butterfly');
    });
});
