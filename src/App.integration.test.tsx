import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
