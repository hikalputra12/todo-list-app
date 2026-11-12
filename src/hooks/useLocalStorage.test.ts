import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('updates value and saves to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test_key')!)).toBe('updated');
  });

  it('falls back to initial value when stored JSON is corrupted', () => {
    localStorage.setItem('corrupt_key', '{broken_json');
    const { result } = renderHook(() => useLocalStorage('corrupt_key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
