import React from 'react';
import { TodoItem as TodoItemType } from '../../types';
import { Trash2, Archive } from 'lucide-react';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToBacklog?: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onMoveToBacklog,
}) => {
  return (
    <div
      className={`group flex items-center justify-between p-3.5 my-2 rounded-lg border transition-all duration-300 ${
        todo.isCompleted
          ? 'bg-[#F0ECE4]/80 border-[#E0D8CB] text-[#78716C]'
          : 'bg-[#F5F1EB] border-[#E7E0D6] text-[#2D2A26] shadow-sm hover:border-[#D4C8B8]'
      }`}
    >
      <div
        className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer select-none"
        onClick={() => onToggle(todo.id)}
      >
        {/* Hanko Stamp / Checkbox */}
        <button
          type="button"
          aria-label={todo.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
          className={`w-6 h-6 rounded-sm border flex items-center justify-center transition-all duration-200 shrink-0 ${
            todo.isCompleted
              ? 'border-[#B94938] bg-[#F7E8E5] text-[#B94938] rotate-[-3deg]'
              : 'border-[#C49767] bg-white/70 hover:border-[#B94938]'
          }`}
        >
          {todo.isCompleted ? (
            <span className="text-xs font-serif font-bold select-none leading-none">
              済
            </span>
          ) : null}
        </button>

        {/* Title */}
        <span
          className={`text-sm tracking-wide font-normal truncate transition-all duration-300 ${
            todo.isCompleted ? 'line-through text-[#78716C] italic' : 'text-[#2D2A26]'
          }`}
        >
          {todo.title}
        </span>
      </div>

      {/* Action buttons (min tap target 44px on mobile) */}
      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {onMoveToBacklog && (
          <button
            type="button"
            title="Simpan ke Pikiran Tersimpan"
            aria-label="Pindahkan ke backlog"
            onClick={(e) => {
              e.stopPropagation();
              onMoveToBacklog(todo.id);
            }}
            className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#C49767] transition-colors rounded"
          >
            <Archive size={15} />
          </button>
        )}
        <button
          type="button"
          title="Hapus tugas"
          aria-label="Hapus tugas"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          className="w-8 h-8 flex items-center justify-center text-[#78716C] hover:text-[#B94938] transition-colors rounded"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
