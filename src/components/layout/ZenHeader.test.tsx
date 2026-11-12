import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZenHeader } from './ZenHeader';

describe('ZenHeader', () => {
  it('renders title and calm date header', () => {
    render(<ZenHeader title="Washi Focus" />);
    expect(screen.getByText('Washi Focus')).toBeInTheDocument();
    expect(screen.getByText(/Waktu Tenang/i)).toBeInTheDocument();
  });
});
