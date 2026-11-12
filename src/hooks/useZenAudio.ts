import { useState, useRef, useEffect, useCallback } from 'react';
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
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

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
    (sound: AmbientSoundType, volume = ambientSettings.volume) => {
      if (sound === 'none') {
        stopAmbient();
        return;
      }

      const ctx = getOrCreateContext();
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

      // Create procedural sound textures
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
      audioBuffer.copyToChannel(rawBufferData, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      // Filter shaping for warmth
      const filter = ctx.createBiquadFilter();
      if (sound === 'gentle_rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, ctx.currentTime);
      } else if (sound === 'bamboo_wind') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      } else if (sound === 'tea_room') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

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
    [ambientSettings.volume, getOrCreateContext, setAmbientSettings, stopAmbient]
  );

  const setVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume));
      if (gainNodeRef.current && ctxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(clamped * 0.5, ctxRef.current.currentTime);
      }
      setAmbientSettings((prev) => ({ ...prev, volume: clamped }));
    },
    [setAmbientSettings]
  );

  const playBambooClick = useCallback(() => {
    const ctx = getOrCreateContext();
    if (ctx) {
      playBambooTap(ctx);
    }
  }, [getOrCreateContext]);

  const playChime = useCallback(() => {
    const ctx = getOrCreateContext();
    if (ctx) {
      playSingingBowl(ctx);
    }
  }, [getOrCreateContext]);

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
