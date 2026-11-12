import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Project Setup Smoke Test', () => {
  it('renders Washi Focus title', () => {
    render(<App />);
    expect(screen.getByText('Washi Focus')).toBeInTheDocument();
  });
});
