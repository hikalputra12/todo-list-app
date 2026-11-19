import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZenAudio } from './useZenAudio';

/** Minimal Web Audio mock that records created buffer sources. */
function installAudioContextMock(initialState: AudioContextState = 'running') {
  const sources: Array<{
    loop: boolean;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    buffer: unknown;
  }> = [];
  const gains: Array<{ gain: { setValueAtTime: ReturnType<typeof vi.fn> } }> = [];
  let resolveResume: () => void = () => {};

  const param = () => ({ setValueAtTime: vi.fn() });

  class MockAudioContext {
    state: AudioContextState = initialState;
    sampleRate = 8000;
    currentTime = 0;
    destination = {};
    resume = vi.fn(
      () =>
        new Promise<void>((res) => {
          resolveResume = () => {
            this.state = 'running';
            res();
          };
        })
    );
    createBuffer(_ch: number, length: number) {
      const data = new Float32Array(length);
      return { getChannelData: () => data };
    }
    createBufferSource() {
      const s = {
        loop: false,
        buffer: null as unknown,
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      sources.push(s);
      return s;
    }
    createGain() {
      const g = { gain: param(), connect: vi.fn() };
      gains.push(g);
      return g;
    }
    createDynamicsCompressor() {
      return {
        threshold: param(),
        knee: param(),
        ratio: param(),
        attack: param(),
        release: param(),
        connect: vi.fn(),
      };
    }
  }

  vi.stubGlobal('AudioContext', MockAudioContext);
  return { sources, gains, resolveResume: () => resolveResume() };
}

describe('useZenAudio alarm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts a looping alarm at full gain and keeps ringing until stopped', async () => {
    const mock = installAudioContextMock('running');
    const { result } = renderHook(() => useZenAudio());

    await act(async () => {
      await result.current.startAlarm();
    });

    expect(result.current.isAlarmRinging).toBe(true);
    const alarm = mock.sources[mock.sources.length - 1];
    expect(alarm.loop).toBe(true);
    expect(alarm.start).toHaveBeenCalledTimes(1);
    // Alarm gain is full volume, independent of the ambient volume slider (0.6 default)
    expect(mock.gains[mock.gains.length - 1].gain.setValueAtTime).toHaveBeenCalledWith(1, expect.any(Number));

    // Still ringing a long time later: it never stops by itself
    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    expect(result.current.isAlarmRinging).toBe(true);
    expect(alarm.stop).not.toHaveBeenCalled();

    act(() => {
      result.current.stopAlarm();
    });
    expect(result.current.isAlarmRinging).toBe(false);
    expect(alarm.stop).toHaveBeenCalledTimes(1);
  });

  it('does not stack multiple alarms when started repeatedly', async () => {
    const mock = installAudioContextMock('running');
    const { result } = renderHook(() => useZenAudio());

    await act(async () => {
      await result.current.startAlarm();
      await result.current.startAlarm();
      await result.current.startAlarm();
    });

    expect(mock.sources.filter((s) => s.loop)).toHaveLength(1);
  });

  it('does not start playing if stopped before the audio context finished resuming', async () => {
    const mock = installAudioContextMock('suspended');
    const { result } = renderHook(() => useZenAudio());

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.startAlarm();
    });
    expect(result.current.isAlarmRinging).toBe(true);

    act(() => {
      result.current.stopAlarm();
    });
    await act(async () => {
      mock.resolveResume();
      await pending;
    });

    expect(result.current.isAlarmRinging).toBe(false);
    expect(mock.sources.filter((s) => s.loop)).toHaveLength(0);
  });

  it('vibrates repeatedly on supported devices and cancels vibration on stop', async () => {
    installAudioContextMock('running');
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    const { result } = renderHook(() => useZenAudio());

    await act(async () => {
      await result.current.startAlarm();
    });
    act(() => {
      vi.advanceTimersByTime(3_300);
    });
    expect(vibrate.mock.calls.length).toBeGreaterThanOrEqual(3);

    act(() => {
      result.current.stopAlarm();
    });
    expect(vibrate).toHaveBeenLastCalledWith(0);

    const callsAfterStop = vibrate.mock.calls.length;
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(vibrate.mock.calls.length).toBe(callsAfterStop);

    // @ts-expect-error cleanup of test-only property
    delete navigator.vibrate;
  });
});
