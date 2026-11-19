import { useRef, useEffect, useCallback, useState } from 'react';
import { AmbientSoundType } from '../types';
import {
  createAudioBuffers,
  createAlarmPattern,
  ALARM_CYCLE_SECONDS,
  playBambooTap,
  playSingingBowl,
} from '../utils/audioSynthesizer';
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
  const alarmSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const alarmActiveRef = useRef(false);
  const alarmVibrateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

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

  /**
   * Unlock audio during a user gesture (e.g. pressing "Mulai Fokus"), so the alarm can
   * still play later when the timer runs out without any user interaction.
   * iOS Safari additionally requires a sound to be started inside the gesture.
   */
  const primeAudio = useCallback(async () => {
    const ctx = await resumeContextIfNeeded();
    if (!ctx) return;
    try {
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate || 44100);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start();
    } catch {
      // Ignore: priming is best-effort
    }
  }, [resumeContextIfNeeded]);

  const stopAlarm = useCallback(() => {
    alarmActiveRef.current = false;
    if (alarmSourceRef.current) {
      try {
        alarmSourceRef.current.stop();
        alarmSourceRef.current.disconnect();
      } catch {
        // Ignore if already stopped
      }
      alarmSourceRef.current = null;
    }
    if (alarmVibrateRef.current !== null) {
      clearInterval(alarmVibrateRef.current);
      alarmVibrateRef.current = null;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(0);
    }
    setIsAlarmRinging(false);
  }, []);

  /**
   * Start a loud, looping alarm. It keeps ringing until `stopAlarm()` is called.
   * Calling it while already ringing is a no-op (no stacked/overlapping alarms).
   */
  const startAlarm = useCallback(async () => {
    if (alarmActiveRef.current) return;
    alarmActiveRef.current = true;
    setIsAlarmRinging(true);

    // Vibrate on phones too (repeats every cycle until stopped)
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      const pattern = [180, 80, 180, 80, 180];
      navigator.vibrate(pattern);
      alarmVibrateRef.current = setInterval(() => navigator.vibrate(pattern), ALARM_CYCLE_SECONDS * 1000);
    }

    const ctx = await resumeContextIfNeeded();
    // Stopped while we were waiting for the context to resume → don't start
    if (!ctx || !alarmActiveRef.current || alarmSourceRef.current) return;

    const sampleRate = ctx.sampleRate || 44100;
    const data = createAlarmPattern(sampleRate);
    const buffer = ctx.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Full gain (independent of the ambient volume slider) + compressor to push loudness
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, ctx.currentTime);
    compressor.knee.setValueAtTime(6, ctx.currentTime);
    compressor.ratio.setValueAtTime(8, ctx.currentTime);
    compressor.attack.setValueAtTime(0.002, ctx.currentTime);
    compressor.release.setValueAtTime(0.1, ctx.currentTime);

    source.connect(gain);
    gain.connect(compressor);
    compressor.connect(ctx.destination);
    source.start();
    alarmSourceRef.current = source;
  }, [resumeContextIfNeeded]);

  // Unlock (and create, if needed) the AudioContext on any user gesture for mobile browsers
  useEffect(() => {
    const unlockAudio = () => {
      const ctx = getOrCreateContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
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
      if (alarmSourceRef.current) {
        try {
          alarmSourceRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (alarmVibrateRef.current !== null) {
        clearInterval(alarmVibrateRef.current);
      }
    };
  }, []);

  return {
    activeSound: ambientSettings.activeSound,
    volume: ambientSettings.volume,
    isPlaying: ambientSettings.isPlaying,
    isAlarmRinging,
    startAmbient,
    stopAmbient,
    setVolume,
    playBambooClick,
    playChime,
    primeAudio,
    startAlarm,
    stopAlarm,
  };
}
