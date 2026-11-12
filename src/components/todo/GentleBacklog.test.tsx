import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GentleBacklog } from './GentleBacklog';
import { TodoItem } from '../../types';

describe('GentleBacklog', () => {
  const mockBacklog: TodoItem[] = [
    { id: 'b1', title: 'Ide Belajar Nanti', isCompleted: false, createdAt: 1, isDailyFocus: false, order: 1 },
  ];

  it('renders backlog items and allows promoting to daily focus', () => {
    const onPromote = vi.fn();
    render(
      <GentleBacklog
        isOpen={true}
        onClose={vi.fn()}
        todos={mockBacklog}
        onPromote={onPromote}
        onAddBacklog={vi.fn()}
        onDelete={vi.fn()}
        onClearCompleted={vi.fn()}
        isDailyFull={false}
      />
    );
    expect(screen.getByText('Ide Belajar Nanti')).toBeInTheDocument();

    const promoteBtn = screen.getByRole('button', { name: /Jadikan Fokus/i });
    fireEvent.click(promoteBtn);
    expect(onPromote).toHaveBeenCalledWith('b1');
  });

  it('allows adding a new task directly into backlog', () => {
    const onAddBacklog = vi.fn();
    render(
      <GentleBacklog
        isOpen={true}
        onClose={vi.fn()}
        todos={mockBacklog}
        onPromote={vi.fn()}
        onAddBacklog={onAddBacklog}
        onDelete={vi.fn()}
        onClearCompleted={vi.fn()}
        isDailyFull={false}
      />
    );

    const input = screen.getByPlaceholderText(/Catat ide atau rencana lain/i);
    fireEvent.change(input, { target: { value: 'Beli buku baru' } });
    fireEvent.submit(input);

    expect(onAddBacklog).toHaveBeenCalledWith('Beli buku baru');
  });
});
