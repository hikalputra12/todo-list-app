import { describe, it, expect } from 'vitest';
import { createAudioBuffers } from './audioSynthesizer';

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
