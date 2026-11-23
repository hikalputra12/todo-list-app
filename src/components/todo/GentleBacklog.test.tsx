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
      />
    );

    const input = screen.getByPlaceholderText(/Catat ide atau rencana lain/i);
    fireEvent.change(input, { target: { value: 'Beli buku baru' } });
    fireEvent.submit(input);

    expect(onAddBacklog).toHaveBeenCalledWith('Beli buku baru');
  });

  it('keeps promote button enabled even when daily focus already has 6 or more tasks', () => {
    const onPromote = vi.fn();
    const dailyTodos: TodoItem[] = Array.from({ length: 6 }, (_, idx) => ({
      id: `d${idx + 1}`,
      title: `Fokus ${idx + 1}`,
      isCompleted: false,
      createdAt: idx + 1,
      isDailyFocus: true,
      order: idx + 1,
    }));

    render(
      <GentleBacklog
        isOpen={true}
        onClose={vi.fn()}
        todos={[...dailyTodos, ...mockBacklog]}
        onPromote={onPromote}
        onAddBacklog={vi.fn()}
        onDelete={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const promoteBtn = screen.getByRole('button', { name: /Jadikan Fokus/i });
    expect(promoteBtn).toBeEnabled();
    fireEvent.click(promoteBtn);
    expect(onPromote).toHaveBeenCalledWith('b1');
  });

  it('allows editing a backlog item title and keeps drawer open on Escape inside edit input', () => {
    const onClose = vi.fn();
    const onEdit = vi.fn();

    render(
      <GentleBacklog
        isOpen={true}
        onClose={onClose}
        todos={mockBacklog}
        onPromote={vi.fn()}
        onAddBacklog={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
        onClearCompleted={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Ubah tugas/i }));
    const editInput = screen.getByLabelText('Ubah judul tugas');
    fireEvent.keyDown(editInput, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Ubah tugas/i }));
    const editInput2 = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(editInput2, { target: { value: 'Ide Diperbarui' } });
    fireEvent.submit(editInput2);

    expect(onEdit).toHaveBeenCalledWith('b1', 'Ide Diperbarui');
  });
});
