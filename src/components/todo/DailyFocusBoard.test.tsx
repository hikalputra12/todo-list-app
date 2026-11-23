import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyFocusBoard } from './DailyFocusBoard';
import { TodoItem } from '../../types';

describe('DailyFocusBoard', () => {
  const mockTodos: TodoItem[] = [
    { id: '1', title: 'Tugas 1', isCompleted: false, createdAt: 1, isDailyFocus: true, order: 1 },
    { id: '2', title: 'Tugas 2', isCompleted: false, createdAt: 2, isDailyFocus: true, order: 2 },
    { id: '3', title: 'Tugas 3', isCompleted: false, createdAt: 3, isDailyFocus: true, order: 3 },
    { id: '4', title: 'Tugas 4', isCompleted: false, createdAt: 4, isDailyFocus: true, order: 4 },
    { id: '5', title: 'Tugas 5', isCompleted: false, createdAt: 5, isDailyFocus: true, order: 5 },
  ];

  it('renders active focus items', () => {
    render(
      <DailyFocusBoard
        todos={mockTodos}
        onToggle={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onOpenBacklog={vi.fn()}
      />
    );
    expect(screen.getByText('Tugas 1')).toBeInTheDocument();
    expect(screen.getByText('Tugas 5')).toBeInTheDocument();
  });

  it('allows adding more than 5 focus items without showing a cap notification', () => {
    const eightTodos: TodoItem[] = Array.from({ length: 8 }, (_, idx) => ({
      id: `${idx + 1}`,
      title: `Tugas ${idx + 1}`,
      isCompleted: false,
      createdAt: idx + 1,
      isDailyFocus: true,
      order: idx + 1,
    }));

    render(
      <DailyFocusBoard
        todos={eightTodos}
        onToggle={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onOpenBacklog={vi.fn()}
      />
    );

    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Tugas ${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByText(/sudah cukup penuh/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i)).toBeInTheDocument();
  });
});
