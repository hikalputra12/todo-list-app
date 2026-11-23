import { StrictMode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

describe('Washi Focus App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows adding a task, viewing the timer, and toggling focus completion', async () => {
    render(<App />);
    expect(screen.getByText(/Waktu Tenang/i)).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    // Add a new daily focus task
    const input = screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i);
    fireEvent.change(input, { target: { value: 'Belajar Bab 1' } });
    fireEvent.submit(input);

    expect(screen.getByText('Belajar Bab 1')).toBeInTheDocument();

    // Toggle completion
    const taskItem = screen.getByText('Belajar Bab 1');
    fireEvent.click(taskItem);

    // Hanko seal character appears
    expect(screen.getByText('済')).toBeInTheDocument();
  });

  it('allows adding unlimited daily focus tasks (more than 5)', () => {
    render(<App />);

    for (let i = 1; i <= 8; i++) {
      const input = screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i);
      fireEvent.change(input, { target: { value: `Tugas ${i}` } });
      fireEvent.submit(input);
    }

    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Tugas ${i}`)).toBeInTheDocument();
    }
    expect(screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i)).toBeInTheDocument();
    expect(screen.getByText('0/8 selesai')).toBeInTheDocument();
  });

  it('allows editing an existing task title without toggling completion and persists to localStorage', () => {
    render(<App />);

    const addInput = screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i);
    fireEvent.change(addInput, { target: { value: 'Belajar Bab 1' } });
    fireEvent.submit(addInput);

    expect(screen.getByText('Belajar Bab 1')).toBeInTheDocument();
    expect(screen.getByText('0/1 selesai')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ubah tugas/i }));
    const editInput = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(editInput, { target: { value: 'Belajar Bab 2' } });
    fireEvent.submit(editInput);

    expect(screen.getByText('Belajar Bab 2')).toBeInTheDocument();
    expect(screen.queryByText('Belajar Bab 1')).not.toBeInTheDocument();
    expect(screen.getByText('0/1 selesai')).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem('washi_todos_v1')!);
    expect(stored[0].title).toBe('Belajar Bab 2');
  });

  describe('time-up alarm', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      localStorage.setItem(
        'washi_timer_settings_v1',
        JSON.stringify({ focusDuration: 1, shortBreakDuration: 5, longBreakDuration: 15 })
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('rings when the timer runs out and keeps ringing until the user stops it', () => {
      render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      expect(screen.getByText('01:00')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Mulai timer/i }));
      act(() => {
        vi.advanceTimersByTime(61_000);
      });

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Waktu habis!')).toBeInTheDocument();

      // Does not dismiss itself
      act(() => {
        vi.advanceTimersByTime(5 * 60_000);
      });
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Hentikan Alarm/i }));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      // Timer moved on to the break
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });
  });
});
