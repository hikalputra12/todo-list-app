import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Project Setup Smoke Test', () => {
  it('renders calm header', () => {
    render(<App />);
    expect(screen.getByText(/Waktu Tenang/i)).toBeInTheDocument();
  });
});
