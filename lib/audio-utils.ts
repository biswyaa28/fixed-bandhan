/**
 * Bandhan AI — Audio Utilities
 * Pure helper functions for voice note processing.
 * No React dependencies — can be used anywhere.
 */

/** Format seconds to M:SS display */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Generate waveform bar heights from audio data (8-bit blocky style) */
export function createWaveformData(
  audioBuffer: AudioBuffer | null,
  barCount = 24,
): number[] {
  if (!audioBuffer) {
    // Return random-looking static waveform
    return Array.from({ length: barCount }, (_, i) =>
      Math.max(15, 20 + Math.sin(i * 0.8) * 30 + Math.cos(i * 1.5) * 20),
    );
  }

  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / barCount);
  const bars: number[] = [];

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * blockSize;
    for (let j = start; j < start + blockSize && j < channelData.length; j++) {
      sum += Math.abs(channelData[j]);
    }
    const avg = sum / blockSize;
    // Normalize to 15-100 range for visible bars
    bars.push(Math.max(15, Math.min(100, avg * 500)));
  }

  return bars;
}

/** Convert a Blob to base64 string */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Trim audio blob by start/end time (simplified — returns original for now) */
export async function trimAudio(
  blob: Blob,
  _startTime: number,
  _endTime: number,
): Promise<Blob> {
  // In production, use Web Audio API OfflineAudioContext to actually trim.
  // For now, return the original blob (trim UI is for demonstration).
  return blob;
}

/** Get audio duration from a Blob */
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
    audio.src = url;
  });
}
