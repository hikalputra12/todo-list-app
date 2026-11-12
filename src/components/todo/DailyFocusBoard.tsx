import React from 'react';
import { TodoItem as TodoItemType } from '../../types';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { BookOpen, Sparkles } from 'lucide-react';

interface DailyFocusBoardProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onOpenBacklog: () => void;
  onMoveToBacklog?: (id: string) => void;
  backlogCount?: number;
}

export const DailyFocusBoard: React.FC<DailyFocusBoardProps> = ({
  todos,
  onToggle,
  onAdd,
  onDelete,
  onOpenBacklog,
  onMoveToBacklog,
  backlogCount = 0,
}) => {
  const dailyTodos = todos.filter((t) => t.isDailyFocus);
  const isCapReached = dailyTodos.length >= 5;
  const completedCount = dailyTodos.filter((t) => t.isCompleted).length;

  return (
    <section className="w-full my-4 flex flex-col">
      {/* Board Header & Progress Badge */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-serif font-medium tracking-wide text-[#2D2A26]">
            Fokus Hari Ini
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F5F1EB] border border-[#E7E0D6] text-[#78716C]">
            {completedCount}/{dailyTodos.length} selesai
          </span>
        </div>

        {/* Backlog button */}
        <button
          type="button"
          onClick={onOpenBacklog}
          className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#C49767] transition-colors py-1 px-2 rounded hover:bg-[#F5F1EB]"
        >
          <BookOpen size={14} />
          <span>Pikiran Tersimpan</span>
          {backlogCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#E7E0D6] text-[10px] font-mono flex items-center justify-center text-[#2D2A26]">
              {backlogCount}
            </span>
          )}
        </button>
      </div>

      {/* Task input or cap notification */}
      {isCapReached ? (
        <div className="p-3 my-2 rounded-lg bg-[#F5F1EB] border border-[#E7E0D6] text-xs text-[#78716C] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#C49767]" />
            <span>Pikiran hari ini sudah cukup penuh (5/5).</span>
          </div>
          <button
            type="button"
            onClick={onOpenBacklog}
            className="text-[#C49767] hover:underline font-medium text-xs ml-2 shrink-0"
          >
            Tulis di Laci
          </button>
        </div>
      ) : (
        <TodoInput onAdd={onAdd} />
      )}

      {/* Todo items list */}
      <div className="flex flex-col mt-1">
        {dailyTodos.length === 0 ? (
          <div className="py-8 text-center text-[#78716C] text-xs font-serif italic border border-dashed border-[#E7E0D6] rounded-lg my-2 px-4 bg-[#FBF9F5]">
            Kertas masih bersih. Apa satu hal bermakna yang ingin Anda mulai hari ini?
          </div>
        ) : (
          dailyTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onMoveToBacklog={onMoveToBacklog}
            />
          ))
        )}
      </div>
    </section>
  );
};
