import React, { useState, useEffect } from 'react';
import { TodoItem as TodoItemType } from '../../types';
import { X, ArrowUpRight, Trash2, Sparkles, Wind } from 'lucide-react';

interface GentleBacklogProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItemType[];
  onPromote: (id: string) => void;
  onAddBacklog: (title: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  isDailyFull: boolean;
}

export const GentleBacklog: React.FC<GentleBacklogProps> = ({
  isOpen,
  onClose,
  todos,
  onPromote,
  onAddBacklog,
  onDelete,
  onClearCompleted,
  isDailyFull,
}) => {
  const [newText, setNewText] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const backlogItems = todos.filter((t) => !t.isDailyFocus);
  const completedCount = todos.filter((t) => t.isCompleted).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (trimmed) {
      onAddBacklog(trimmed);
      setNewText('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FBF9F5] border-t border-[#E7E0D6] rounded-t-2xl p-5 shadow-2xl flex flex-col max-h-[82vh] transition-transform duration-300 animate-slideUp safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D6]">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-medium text-[#2D2A26]">
              Pikiran Tersimpan
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F5F1EB] border border-[#E7E0D6] text-[#78716C]">
              {backlogItems.length} ide
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup laci"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EB] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input for Backlog */}
        <form onSubmit={handleAdd} className="my-3">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Catat ide atau rencana lain..."
            className="w-full px-4 py-2.5 rounded-lg bg-[#F5F1EB] border border-[#E7E0D6] text-xs text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:border-[#C49767] focus:ring-1 focus:ring-[#C49767]/30 transition-all shadow-inner"
          />
        </form>

        {/* Items Scroll Area */}
        <div className="overflow-y-auto flex-1 my-1 space-y-2 pr-1">
          {backlogItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#78716C] italic font-serif">
              Belum ada pikiran tersimpan. Anda bisa mencatat ide masa depan di sini.
            </div>
          ) : (
            backlogItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F5F1EB] border border-[#E7E0D6] text-xs transition-all"
              >
                <span className="text-[#2D2A26] flex-1 truncate pr-2">
                  {item.title}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={isDailyFull}
                    onClick={() => onPromote(item.id)}
                    aria-label="Jadikan Fokus"
                    title={isDailyFull ? 'Fokus harian sudah penuh (maks 5)' : 'Pindahkan ke Fokus Hari Ini'}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE9DF] hover:bg-[#E5DDCF] disabled:opacity-40 text-[#2D2A26] font-medium transition-colors text-[11px]"
                  >
                    <span>Jadikan Fokus</span>
                    <ArrowUpRight size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label="Hapus dari backlog"
                    className="w-7 h-7 flex items-center justify-center text-[#78716C] hover:text-[#B94938] transition-colors rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ritual "Sapu Halaman" Footer */}
        {completedCount > 0 && (
          <div className="pt-3 mt-2 border-t border-[#E7E0D6] flex items-center justify-between">
            <span className="text-[11px] text-[#78716C] flex items-center gap-1">
              <Sparkles size={12} className="text-[#C49767]" />
              {completedCount} tugas telah selesai
            </span>
            <button
              type="button"
              onClick={onClearCompleted}
              className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#2D2A26] px-3 py-1.5 rounded-lg border border-[#E7E0D6] bg-[#F5F1EB] hover:bg-[#EAE4D8] transition-all font-serif"
            >
              <Wind size={13} className="text-[#C49767]" />
              <span>Sapu Halaman</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
