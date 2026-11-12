import { useState, useCallback, useMemo } from 'react';
import { TodoItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePomodoro } from './hooks/usePomodoro';
import { useZenAudio } from './hooks/useZenAudio';
import { WashiContainer } from './components/layout/WashiContainer';
import { ZenHeader } from './components/layout/ZenHeader';
import { EnsoTimer } from './components/timer/EnsoTimer';
import { DailyFocusBoard } from './components/todo/DailyFocusBoard';
import { GentleBacklog } from './components/todo/GentleBacklog';
import { AmbientSoundBar } from './components/audio/AmbientSoundBar';
import { ZenCelebration } from './components/feedback/ZenCelebration';

export default function App() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('washi_todos_v1', []);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Audio Engine Hook
  const {
    activeSound,
    volume,
    isPlaying,
    startAmbient,
    setVolume,
    playBambooClick,
    playChime,
  } = useZenAudio();

  // Pomodoro Timer Hook
  const { timerState, start, pause, reset, switchMode, progress } = usePomodoro(() => {
    playChime();
  });

  const dailyTodos = useMemo(() => todos.filter((t) => t.isDailyFocus), [todos]);
  const backlogTodos = useMemo(() => todos.filter((t) => !t.isDailyFocus), [todos]);
  const isDailyFull = dailyTodos.length >= 5;

  // Add Task to Daily Focus
  const handleAddDaily = useCallback(
    (title: string) => {
      if (dailyTodos.length >= 5) return;
      const newTodo: TodoItem = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title,
        isCompleted: false,
        createdAt: Date.now(),
        isDailyFocus: true,
        order: dailyTodos.length + 1,
      };
      setTodos((prev) => [newTodo, ...prev]);
      playBambooClick();
    },
    [dailyTodos.length, setTodos, playBambooClick]
  );

  // Add Task to Backlog
  const handleAddBacklog = useCallback(
    (title: string) => {
      const newTodo: TodoItem = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title,
        isCompleted: false,
        createdAt: Date.now(),
        isDailyFocus: false,
        order: backlogTodos.length + 1,
      };
      setTodos((prev) => [newTodo, ...prev]);
      playBambooClick();
    },
    [backlogTodos.length, setTodos, playBambooClick]
  );

  // Toggle Task Completion
  const handleToggle = useCallback(
    (id: string) => {
      setTodos((prev) => {
        const next = prev.map((t) => {
          if (t.id === id) {
            const nextCompleted = !t.isCompleted;
            return {
              ...t,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? Date.now() : undefined,
            };
          }
          return t;
        });

        // Check if all daily tasks are now completed
        const nextDaily = next.filter((t) => t.isDailyFocus);
        if (nextDaily.length > 0 && nextDaily.every((t) => t.isCompleted)) {
          setShowCelebration(true);
        }

        return next;
      });
      playBambooClick();
    },
    [setTodos, playBambooClick]
  );

  // Move Daily Focus back to Backlog
  const handleMoveToBacklog = useCallback(
    (id: string) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDailyFocus: false } : t))
      );
      playBambooClick();
    },
    [setTodos, playBambooClick]
  );

  // Promote Backlog Task to Daily Focus
  const handlePromote = useCallback(
    (id: string) => {
      if (isDailyFull) return;
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDailyFocus: true } : t))
      );
      playBambooClick();
    },
    [isDailyFull, setTodos, playBambooClick]
  );

  // Delete Task
  const handleDelete = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      playBambooClick();
    },
    [setTodos, playBambooClick]
  );

  // "Sapu Halaman" Ritual: Clear all completed tasks
  const handleClearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.isCompleted));
    playBambooClick();
  }, [setTodos, playBambooClick]);

  return (
    <WashiContainer>
      {/* Poetic Header */}
      <ZenHeader title="Washi Focus" subtitle="Waktu Tenang" />

      {/* Ensō Pomodoro Timer */}
      <EnsoTimer
        timeLeft={timerState.timeLeft}
        isRunning={timerState.isRunning}
        mode={timerState.mode}
        progress={progress}
        onToggle={() => (timerState.isRunning ? pause() : start())}
        onReset={reset}
        onSwitchMode={switchMode}
      />

      {/* Daily 3-5 Focus List */}
      <DailyFocusBoard
        todos={todos}
        onToggle={handleToggle}
        onAdd={handleAddDaily}
        onDelete={handleDelete}
        onOpenBacklog={() => setIsBacklogOpen(true)}
        onMoveToBacklog={handleMoveToBacklog}
        backlogCount={backlogTodos.length}
      />

      {/* Gentle Backlog Modal Drawer */}
      <GentleBacklog
        isOpen={isBacklogOpen}
        onClose={() => setIsBacklogOpen(false)}
        todos={todos}
        onPromote={handlePromote}
        onAddBacklog={handleAddBacklog}
        onDelete={handleDelete}
        onClearCompleted={handleClearCompleted}
        isDailyFull={isDailyFull}
      />

      {/* Ambient Sound Dock */}
      <AmbientSoundBar
        activeSound={activeSound}
        volume={volume}
        isPlaying={isPlaying}
        onSelectSound={startAmbient}
        onVolumeChange={setVolume}
      />

      {/* Celebration Leaf Shower when all daily tasks complete */}
      <ZenCelebration
        show={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
    </WashiContainer>
  );
}
