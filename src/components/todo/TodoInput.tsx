import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TodoInputProps {
  onAdd: (title: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  onAdd,
  placeholder = 'Tulis satu hal yang ingin diselesaikan...',
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onAdd(trimmed);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full my-3">
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-4 pr-12 py-3 rounded-lg bg-[#F5F1EB] border border-[#E7E0D6] text-sm text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:border-[#C49767] focus:ring-1 focus:ring-[#C49767]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Tambah tugas"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center text-[#78716C] hover:text-[#2D2A26] disabled:opacity-30 disabled:hover:text-[#78716C] transition-colors"
      >
        <Plus size={18} />
      </button>
    </form>
  );
};
