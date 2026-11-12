export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  isDailyFocus: boolean; // true = 3-5 Fokus Hari Ini; false = Pikiran Tersimpan (Backlog)
  order: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focusDuration: number;      // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number;  // in minutes (default 15)
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number;        // in seconds
  isRunning: boolean;
  sessionsCompleted: number;
  settings: TimerSettings;
}

export type AmbientSoundType = 'none' | 'gentle_rain' | 'bamboo_wind' | 'tea_room' | 'temple_stream';

export interface AmbientState {
  activeSound: AmbientSoundType;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}
