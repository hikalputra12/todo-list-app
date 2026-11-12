import { useRef, useEffect, useCallback } from 'react';
import { AmbientSoundType } from '../types';
import { createAudioBuffers, playBambooTap, playSingingBowl } from '../utils/audioSynthesizer';
import { useLocalStorage } from './useLocalStorage';

export function useZenAudio() {
  const [ambientSettings, setAmbientSettings] = useLocalStorage<{
    activeSound: AmbientSoundType;
    volume: number;
    isPlaying: boolean;
  }>('washi_ambient_settings_v1', {
    activeSound: 'none',
    volume: 0.6,
    isPlaying: false,
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Lazy initialize AudioContext on user gesture
  const getOrCreateContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        ctxRef.current = new AudioCtx();
      }
    }
    return ctxRef.current;
  }, []);

  const resumeContextIfNeeded = useCallback(async () => {
    const ctx = getOrCreateContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }
    return ctx;
  }, [getOrCreateContext]);

  const stopAmbient = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    setAmbientSettings((prev) => ({ ...prev, isPlaying: false, activeSound: 'none' }));
  }, [setAmbientSettings]);

  const startAmbient = useCallback(
    async (sound: AmbientSoundType, volume = ambientSettings.volume) => {
      if (sound === 'none') {
        stopAmbient();
        return;
      }

      const ctx = await resumeContextIfNeeded();
      if (!ctx) return;

      // Stop previous ambient loop if playing
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch {
          // Ignore
        }
      }

      const sampleRate = ctx.sampleRate || 44100;
      const bufferDuration = 5; // 5-second seamless loop
      let rawBufferData: Float32Array;

      // Create procedural sound textures tuned for clear audible warmth on mobile & desktop
      if (sound === 'gentle_rain') {
        rawBufferData = createAudioBuffers.createPinkNoise(sampleRate, bufferDuration);
      } else if (sound === 'bamboo_wind') {
        rawBufferData = createAudioBuffers.createBrownNoise(sampleRate, bufferDuration);
      } else if (sound === 'tea_room') {
        rawBufferData = createAudioBuffers.createBrownNoise(sampleRate, bufferDuration);
      } else {
        rawBufferData = createAudioBuffers.createPinkNoise(sampleRate, bufferDuration);
      }

      const audioBuffer = ctx.createBuffer(1, rawBufferData.length, sampleRate);
      audioBuffer.getChannelData(0).set(rawBufferData);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      // Filter shaping for warmth & clear presence on mobile phone speakers
      const filter = ctx.createBiquadFilter();
      if (sound === 'gentle_rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, ctx.currentTime);
      } else if (sound === 'bamboo_wind') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);
      } else if (sound === 'tea_room') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      const effectiveGain = Math.max(0.01, volume * 0.75);
      gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();

      sourceNodeRef.current = source;
      filterNodeRef.current = filter;
      gainNodeRef.current = gain;

      setAmbientSettings((prev) => ({
        ...prev,
        activeSound: sound,
        isPlaying: true,
        volume,
      }));
    },
    [ambientSettings.volume, resumeContextIfNeeded, setAmbientSettings, stopAmbient]
  );

  const setVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume));
      if (gainNodeRef.current && ctxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(clamped * 0.75, ctxRef.current.currentTime);
      }
      setAmbientSettings((prev) => ({ ...prev, volume: clamped }));
    },
    [setAmbientSettings]
  );

  const playBambooClick = useCallback(async () => {
    const ctx = await resumeContextIfNeeded();
    if (ctx) {
      playBambooTap(ctx);
    }
  }, [resumeContextIfNeeded]);

  const playChime = useCallback(async () => {
    const ctx = await resumeContextIfNeeded();
    if (ctx) {
      playSingingBowl(ctx);
    }
  }, [resumeContextIfNeeded]);

  // One-time unlock listener on touch/click for mobile browsers
  useEffect(() => {
    const unlockAudio = () => {
      if (ctxRef.current && ctxRef.current.state === 'suspended') {
        ctxRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    window.addEventListener('click', unlockAudio, { passive: true, once: true });
    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    activeSound: ambientSettings.activeSound,
    volume: ambientSettings.volume,
    isPlaying: ambientSettings.isPlaying,
    startAmbient,
    stopAmbient,
    setVolume,
    playBambooClick,
    playChime,
  };
}
