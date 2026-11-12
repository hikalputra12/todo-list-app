import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from './usePomodoro';

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with 25 minutes (1500 seconds) in focus mode', () => {
    const { result } = renderHook(() => usePomodoro());
    expect(result.current.timerState.mode).toBe('focus');
    expect(result.current.timerState.timeLeft).toBe(1500);
    expect(result.current.timerState.isRunning).toBe(false);
  });

  it('counts down when started and updates timeLeft', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => {
      result.current.start();
    });
    expect(result.current.timerState.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.timerState.timeLeft).toBe(1495);
  });

  it('can reset timer back to initial duration', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.timerState.timeLeft).toBe(1490);

    act(() => {
      result.current.reset();
    });
    expect(result.current.timerState.timeLeft).toBe(1500);
    expect(result.current.timerState.isRunning).toBe(false);
  });

  it('can switch mode to shortBreak (300 seconds)', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => {
      result.current.switchMode('shortBreak');
    });
    expect(result.current.timerState.mode).toBe('shortBreak');
    expect(result.current.timerState.timeLeft).toBe(300);
  });

  it('allows customizing focus duration in minutes and updates timeLeft when in focus mode', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => {
      result.current.setFocusDuration(50);
    });
    expect(result.current.timerState.settings.focusDuration).toBe(50);
    expect(result.current.timerState.timeLeft).toBe(3000);
  });
});
