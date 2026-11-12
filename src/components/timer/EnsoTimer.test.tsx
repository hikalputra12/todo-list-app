import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnsoTimer } from './EnsoTimer';

describe('EnsoTimer', () => {
  it('displays formatted time string MM:SS', () => {
    render(
      <EnsoTimer
        timeLeft={1500}
        isRunning={false}
        mode="focus"
        progress={0.5}
        onToggle={vi.fn()}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
      />
    );
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('triggers onToggle when Ensō circle is clicked', () => {
    const onToggle = vi.fn();
    render(
      <EnsoTimer
        timeLeft={1500}
        isRunning={false}
        mode="focus"
        progress={0.5}
        onToggle={onToggle}
        onReset={vi.fn()}
        onSwitchMode={vi.fn()}
      />
    );
    const timeDisplay = screen.getByText('25:00');
    fireEvent.click(timeDisplay);
    expect(onToggle).toHaveBeenCalled();
  });
});
