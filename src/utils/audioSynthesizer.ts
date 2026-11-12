export const createAudioBuffers = {
  createPinkNoise: (sampleRate: number, durationSeconds: number): Float32Array => {
    const bufferSize = sampleRate * durationSeconds;
    const output = new Float32Array(bufferSize);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return output;
  },

  createBrownNoise: (sampleRate: number, durationSeconds: number): Float32Array => {
    const bufferSize = sampleRate * durationSeconds;
    const output = new Float32Array(bufferSize);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for volume drop
    }
    return output;
  },
};

/**
 * Play an organic bamboo wood tap feedback sound (40ms)
 */
export function playBambooTap(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Resonant wooden tap frequency profile
  osc.type = 'sine';
  osc.frequency.setValueAtTime(820, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.045);
}

/**
 * Play a soothing Japanese singing bowl (rin gong) chime with harmonic overtones (~3.5s)
 */
export function playSingingBowl(ctx: AudioContext): void {
  const baseFreq = 432; // Meditative peaceful pitch
  const now = ctx.currentTime;
  const duration = 3.5;

  const frequencies = [baseFreq, baseFreq * 2.01, baseFreq * 3.02];
  const gains = [0.35, 0.15, 0.08];

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gains[idx], now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  });
}
