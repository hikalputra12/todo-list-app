import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerMode } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export function usePomodoro(onComplete?: () => void) {
  const [settings, setSettings] = useLocalStorage('washi_timer_settings_v1', DEFAULT_SETTINGS);

  const getDurationForMode = useCallback(
    (mode: TimerMode): number => {
      switch (mode) {
        case 'focus':
          return (settings.focusDuration || 25) * 60;
        case 'shortBreak':
          return (settings.shortBreakDuration || 5) * 60;
        case 'longBreak':
          return (settings.longBreakDuration || 15) * 60;
      }
    },
    [settings]
  );

  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'focus',
    timeLeft: (settings.focusDuration || 25) * 60,
    isRunning: false,
    sessionsCompleted: 0,
    settings,
  });

  const lastTimestampRef = useRef<number | null>(null);

  const setFocusDuration = useCallback(
    (minutes: number) => {
      const validMinutes = Math.max(1, Math.min(240, Math.round(minutes)));
      setSettings((prev) => ({ ...prev, focusDuration: validMinutes }));
      setTimerState((prev) => {
        const nextSettings = { ...prev.settings, focusDuration: validMinutes };
        const isCurrentFocus = prev.mode === 'focus';
        return {
          ...prev,
          settings: nextSettings,
          timeLeft: isCurrentFocus && !prev.isRunning ? validMinutes * 60 : prev.timeLeft,
        };
      });
    },
    [setSettings]
  );

  const start = useCallback(() => {
    lastTimestampRef.current = Date.now();
    setTimerState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    lastTimestampRef.current = null;
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    lastTimestampRef.current = null;
    setTimerState((prev) => ({
      ...prev,
      timeLeft: getDurationForMode(prev.mode),
      isRunning: false,
    }));
  }, [getDurationForMode]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      lastTimestampRef.current = null;
      setTimerState((prev) => ({
        ...prev,
        mode: newMode,
        timeLeft: getDurationForMode(newMode),
        isRunning: false,
      }));
    },
    [getDurationForMode]
  );

  useEffect(() => {
    if (!timerState.isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = lastTimestampRef.current ? Math.floor((now - lastTimestampRef.current) / 1000) : 1;
      
      if (delta >= 1) {
        lastTimestampRef.current = now;
        setTimerState((prev) => {
          const nextTime = prev.timeLeft - delta;
          if (nextTime <= 0) {
            clearInterval(interval);
            lastTimestampRef.current = null;
            if (onComplete) {
              onComplete();
            }
            // Auto transition
            const nextMode: TimerMode = prev.mode === 'focus' ? 'shortBreak' : 'focus';
            const nextSessions = prev.mode === 'focus' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
            return {
              ...prev,
              mode: nextMode,
              timeLeft: getDurationForMode(nextMode),
              isRunning: false,
              sessionsCompleted: nextSessions,
            };
          }
          return {
            ...prev,
            timeLeft: nextTime,
          };
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [timerState.isRunning, getDurationForMode, onComplete]);

  // Calculate visual progress 0 to 1
  const totalDuration = getDurationForMode(timerState.mode);
  const progress = totalDuration > 0 ? (totalDuration - timerState.timeLeft) / totalDuration : 0;

  return {
    timerState,
    start,
    pause,
    reset,
    switchMode,
    setFocusDuration,
    progress,
  };
}
