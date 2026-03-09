/**
 * Real camera service using Web Camera API (getUserMedia)
 */

export interface CameraPermissionStatus {
  status: 'prompt' | 'granted' | 'denied';
}

export async function requestCameraPermission(): Promise<boolean> {
  // Try with preferred facing mode first, fall back to any camera
  const constraints: MediaStreamConstraints[] = [
    { video: { facingMode: 'environment' }, audio: false },
    { video: true, audio: false },
  ];

  for (const constraint of constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraint);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.error('Camera permission denied');
          return false;
        }
        if (error.name === 'NotFoundError') {
          console.error('No camera device found');
          return false;
        }
        // OverconstrainedError or others — try next constraint set
      }
    }
  }
  console.error('Could not access camera with any constraint set');
  return false;
}

export async function getCameraPermissionStatus(): Promise<CameraPermissionStatus['status']> {
  try {
    const result = await navigator.permissions?.query({ name: 'camera' });
    return result?.state || 'prompt';
  } catch {
    return 'prompt';
  }
}

/**
 * Attempts to open a camera stream with progressively relaxed constraints:
 *   1. Exact facingMode + ideal HD resolution
 *   2. Preferred facingMode (non-exact) + ideal HD resolution
 *   3. Any camera, no resolution preference
 *
 * This prevents OverconstrainedError on desktop or single-camera devices.
 */
export async function startCameraStream(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream> {
  const constraintSets: MediaStreamConstraints[] = [
    // Tier 1: exact facing mode + ideal resolution (best for mobile rear cam)
    {
      video: {
        facingMode: { exact: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    },
    // Tier 2: preferred facing mode (non-exact) + ideal resolution
    {
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    // Tier 3: any camera, no extra constraints (desktop fallback)
    { video: true, audio: false },
  ];

  let lastError: unknown;

  for (const constraints of constraintSets) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
      // Store the resolved facing mode so captureFrame can mirror correctly
      (videoElement as any).__facingMode = facingMode;

      return new Promise<MediaStream>((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play().then(() => resolve(stream)).catch(reject);
        };
        const timer = setTimeout(
          () => reject(new Error('Timeout waiting for video metadata')),
          5000
        );
        // Clear the timeout if we resolve early
        videoElement.addEventListener('loadedmetadata', () => clearTimeout(timer), { once: true });
      });
    } catch (error) {
      lastError = error;
      const name = error instanceof DOMException ? error.name : 'Unknown';
      // Hard failures — no point retrying with relaxed constraints
      if (name === 'NotAllowedError' || name === 'NotFoundError') {
        console.error(`Camera access failed (${name}):`, error);
        throw error;
      }
      // Soft failures (OverconstrainedError, etc.) — try next tier
      console.warn(`Camera constraint tier failed (${name}), trying next…`);
    }
  }

  console.error('All camera constraint tiers exhausted:', lastError);
  throw lastError;
}

export async function stopCameraStream(stream: MediaStream): Promise<void> {
  stream.getTracks().forEach(track => track.stop());
}

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedContext: CanvasRenderingContext2D | null = null;

export function captureFrame(
  videoElement: HTMLVideoElement,
  width: number = 1280,
  height: number = 960,
  quality: number = 0.8  // Optimizing default quality for Live Mode
): string {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedContext = sharedCanvas.getContext('2d', { willReadFrequently: true });
  }

  sharedCanvas.width = width;
  sharedCanvas.height = height;

  const context = sharedContext;
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  // Ensure fresh background before drawing
  context.clearRect(0, 0, width, height);

  // Mirror the image for front-facing camera
  const isFrontCamera = (videoElement as any).__facingMode === 'user';
  if (isFrontCamera) {
    context.save();
    context.scale(-1, 1);
    context.drawImage(videoElement, -width, 0, width, height);
    context.restore();
  } else {
    context.drawImage(videoElement, 0, 0, width, height);
  }

  return sharedCanvas.toDataURL('image/jpeg', quality);
}

export async function toggleFlashlight(_enable: boolean): Promise<boolean> {
  try {
    const stream = (await navigator.mediaDevices.enumerateDevices()).find(
      device => device.kind === 'videoinput'
    );

    if (!stream) return false;

    // Note: Flash control requires specific browser support
    // This is a basic implementation - actual flash control varies by browser
    return true;
  } catch (error) {
    console.error('Error toggling flash:', error);
    return false;
  }
}

export async function switchCamera(
  currentMode: 'user' | 'environment'
): Promise<'user' | 'environment'> {
  return currentMode === 'user' ? 'environment' : 'user';
}
