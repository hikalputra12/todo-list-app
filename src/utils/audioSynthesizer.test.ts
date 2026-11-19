import { describe, it, expect } from 'vitest';
import {
  createAudioBuffers,
  createAlarmPattern,
  ALARM_CYCLE_SECONDS,
  ALARM_PEAK_AMPLITUDE,
} from './audioSynthesizer';

describe('createAlarmPattern', () => {
  const sampleRate = 44100;
  const buffer = createAlarmPattern(sampleRate);

  it('produces exactly one alarm cycle of samples', () => {
    expect(buffer.length).toBe(Math.floor(sampleRate * ALARM_CYCLE_SECONDS));
  });

  it('is loud: peaks near full scale but never clips past it', () => {
    let peak = 0;
    for (const v of buffer) peak = Math.max(peak, Math.abs(v));
    expect(peak).toBeGreaterThan(0.9);
    expect(peak).toBeLessThanOrEqual(ALARM_PEAK_AMPLITUDE + 1e-6);
  });

  it('has high RMS energy during a beep (near-square wave, not a soft sine)', () => {
    // Middle of the first beep (0.05s–0.15s)
    const slice = buffer.subarray(Math.floor(0.05 * sampleRate), Math.floor(0.15 * sampleRate));
    const rms = Math.sqrt(slice.reduce((s, v) => s + v * v, 0) / slice.length);
    // A pure sine at 0.95 peak has RMS ≈ 0.67; the soft-clipped wave must be louder.
    expect(rms).toBeGreaterThan(0.75);
  });

  it('ends with a silent pause so the looped beeps are distinguishable', () => {
    const tail = buffer.subarray(Math.floor(1.0 * sampleRate));
    expect(tail.every((v) => v === 0)).toBe(true);
  });

  it('starts and ends at zero to avoid clicks when looping', () => {
    expect(Math.abs(buffer[0])).toBeLessThan(0.01);
    expect(Math.abs(buffer[buffer.length - 1])).toBeLessThan(0.01);
  });
});

describe('audioSynthesizer buffer generator', () => {
  it('generates pink noise buffer correctly with non-zero samples', () => {
    const buffer = createAudioBuffers.createPinkNoise(44100, 1);
    expect(buffer.length).toBe(44100 * 1);
    expect(buffer.some(val => val !== 0)).toBe(true);
  });

  it('generates brown noise buffer correctly with non-zero samples', () => {
    const buffer = createAudioBuffers.createBrownNoise(44100, 1);
    expect(buffer.length).toBe(44100 * 1);
    expect(buffer.some(val => val !== 0)).toBe(true);
  });
});
