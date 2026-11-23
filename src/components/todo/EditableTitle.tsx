import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

interface EditableTitleProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  inputClassName?: string;
}

/**
 * Inline title editor used by both daily focus items and backlog items.
 * Saves on Enter, submit button, or blur (when non-empty and changed), and cancels on Escape or cancel button.
 */
export const EditableTitle: React.FC<EditableTitleProps> = ({
  initialValue,
  onSave,
  onCancel,
  inputClassName = '',
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const trimmed = value.trim();
    if (trimmed && trimmed !== initialValue) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  const cancel = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    commit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1 flex-1 min-w-0">
      <input
        ref={inputRef}
        type="text"
        aria-label="Ubah judul tugas"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`flex-1 min-w-0 px-2 py-1 rounded bg-white/80 border border-[#C49767] text-sm text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#C49767]/30 ${inputClassName}`}
      />
      <button
        type="submit"
        aria-label="Simpan perubahan"
        title="Simpan perubahan"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded text-[#78716C] hover:text-[#2D2A26] transition-colors"
      >
        <Check size={15} />
      </button>
      <button
        type="button"
        aria-label="Batal ubah"
        title="Batal ubah"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          cancel();
        }}
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded text-[#78716C] hover:text-[#B94938] transition-colors"
      >
        <X size={15} />
      </button>
    </form>
  );
};
