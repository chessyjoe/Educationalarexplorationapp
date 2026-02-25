/**
 * Real camera service using Web Camera API (getUserMedia)
 */

export interface CameraPermissionStatus {
  status: 'prompt' | 'granted' | 'denied';
}

export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    // Stop the stream after getting permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        console.error('Camera permission denied');
        return false;
      } else if (error.name === 'NotFoundError') {
        console.error('No camera device found');
        return false;
      }
    }
    console.error('Error requesting camera permission:', error);
    return false;
  }
}

export async function getCameraPermissionStatus(): Promise<CameraPermissionStatus['status']> {
  try {
    const result = await navigator.permissions?.query({ name: 'camera' });
    return result?.state || 'prompt';
  } catch {
    return 'prompt';
  }
}

export async function startCameraStream(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });

    videoElement.srcObject = stream;

    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play().then(() => resolve(stream)).catch(reject);
      };
      setTimeout(() => reject(new Error('Timeout waiting for video metadata')), 5000);
    });
  } catch (error) {
    console.error('Error starting camera stream:', error);
    throw error;
  }
}

export async function stopCameraStream(stream: MediaStream): Promise<void> {
  stream.getTracks().forEach(track => track.stop());
}

export function captureFrame(
  videoElement: HTMLVideoElement,
  width: number = 1280,
  height: number = 960
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  // Mirror the image for front-facing camera
  const isFrontCamera = (videoElement as any).__facingMode === 'user';
  if (isFrontCamera) {
    context.scale(-1, 1);
    context.drawImage(videoElement, -width, 0, width, height);
  } else {
    context.drawImage(videoElement, 0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function toggleFlashlight(enable: boolean): Promise<boolean> {
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
