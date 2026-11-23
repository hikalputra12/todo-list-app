import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditableTitle } from './EditableTitle';

describe('EditableTitle', () => {
  it('saves trimmed value once on Enter even if blur follows', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableTitle initialValue="Judul Lama" onSave={onSave} onCancel={onCancel} />);

    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(input, { target: { value: '  Baru  ' } });
    fireEvent.submit(input);
    fireEvent.blur(input);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Baru');
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel and not onSave on Escape', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableTitle initialValue="Judul Lama" onSave={onSave} onCancel={onCancel} />);

    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(input, { target: { value: 'Berubah' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when value is empty or whitespace only', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableTitle initialValue="Judul Lama" onSave={onSave} onCancel={onCancel} />);

    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when value is unchanged', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableTitle initialValue="Judul Lama" onSave={onSave} onCancel={onCancel} />);

    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.submit(input);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves when the checkmark button is clicked', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<EditableTitle initialValue="Judul Lama" onSave={onSave} onCancel={onCancel} />);

    const input = screen.getByLabelText('Ubah judul tugas');
    fireEvent.change(input, { target: { value: 'Judul Baru' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan perubahan/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Judul Baru');
    expect(onCancel).not.toHaveBeenCalled();
  });
});
