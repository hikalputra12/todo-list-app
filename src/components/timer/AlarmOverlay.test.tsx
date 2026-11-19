import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlarmOverlay } from './AlarmOverlay';

describe('AlarmOverlay', () => {
  it('renders nothing when not ringing', () => {
    render(<AlarmOverlay isRinging={false} nextMode="shortBreak" onStop={() => {}} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the alert with a focused stop button that calls onStop', () => {
    const onStop = vi.fn();
    render(<AlarmOverlay isRinging nextMode="shortBreak" onStop={onStop} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Waktu habis!')).toBeInTheDocument();
    expect(screen.getByText(/Saatnya rehat sejenak/i)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Hentikan Alarm/i });
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('shows a back-to-focus message after a break ends', () => {
    render(<AlarmOverlay isRinging nextMode="focus" onStop={() => {}} />);
    expect(screen.getByText(/kembali fokus/i)).toBeInTheDocument();
  });

  it('restores the document title after it stops ringing', () => {
    document.title = 'Washi Focus';
    const { rerender } = render(<AlarmOverlay isRinging nextMode="shortBreak" onStop={() => {}} />);
    expect(document.title).toBe('⏰ Waktu habis!');
    rerender(<AlarmOverlay isRinging={false} nextMode="shortBreak" onStop={() => {}} />);
    expect(document.title).toBe('Washi Focus');
  });
});
