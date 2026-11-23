import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { TodoItem as TodoItemType } from '../../types';

describe('TodoItem', () => {
  const sampleTodo: TodoItemType = {
    id: 't1',
    title: 'Membaca buku',
    isCompleted: false,
    createdAt: 1,
    isDailyFocus: true,
    order: 1,
  };

  it('opens inline input on edit click, saves on Enter, and does not toggle completion', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <TodoItem
        todo={sampleTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Ubah tugas/i }));
    const input = screen.getByLabelText('Ubah judul tugas') as HTMLInputElement;
    expect(input.value).toBe('Membaca buku');

    // Clicking input / Hanko checkbox while editing must not toggle completion
    fireEvent.click(input);
    fireEvent.click(screen.getByRole('button', { name: /Tandai selesai/i }));
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Membaca artikel' } });
    fireEvent.submit(input);

    expect(onEdit).toHaveBeenCalledWith('t1', 'Membaca artikel');
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('restores original title and calls neither onEdit nor onToggle on Escape', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <TodoItem
        todo={sampleTodo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Ubah tugas/i }));
    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(input, { target: { value: 'Batal ubah' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('Membaca buku')).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();
  });
});
