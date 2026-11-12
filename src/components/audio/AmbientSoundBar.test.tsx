import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AmbientSoundBar } from './AmbientSoundBar';

describe('AmbientSoundBar', () => {
  it('renders sound buttons and switches active track on click', () => {
    const onSelectSound = vi.fn();
    render(
      <AmbientSoundBar
        activeSound="none"
        volume={0.6}
        isPlaying={false}
        onSelectSound={onSelectSound}
        onVolumeChange={vi.fn()}
      />
    );

    const rainBtn = screen.getByRole('button', { name: /Hujan/i });
    fireEvent.click(rainBtn);
    expect(onSelectSound).toHaveBeenCalledWith('gentle_rain');
  });

  it('triggers onVolumeChange when slider moves', () => {
    const onVolumeChange = vi.fn();
    render(
      <AmbientSoundBar
        activeSound="gentle_rain"
        volume={0.6}
        isPlaying={true}
        onSelectSound={vi.fn()}
        onVolumeChange={onVolumeChange}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(onVolumeChange).toHaveBeenCalledWith(0.8);
  });
});
