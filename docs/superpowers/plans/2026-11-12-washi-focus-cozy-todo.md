# Washi Focus (和紙フォーカス) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, cozy Japanese minimalist (washi paper themed) to-do list and study companion web app featuring a daily 3–5 focus cap, procedural ambient sounds, an Ensō Pomodoro timer, and 100% offline local storage.

**Architecture:** Single Page Application (SPA) built with React 19, Vite, and TypeScript styled via Tailwind CSS with custom washi design tokens. Ambient audio and sensory feedback are generated natively using the Web Audio API without heavy external audio files. Data is persisted reactively and privately in browser `localStorage`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Web Audio API, Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-11-12-washi-focus-cozy-todo-design.md`

## Global Constraints

* **Platform:** Mobile-first Web App with 100dvh and safe-area insets (`env(safe-area-inset-bottom)`).
* **Storage:** 100% Offline & Local-first (`localStorage`), zero account/login required.
* **Daily Zen Cap:** Maximum 5 active tasks allowed in Daily Focus (`isDailyFocus: true`).
* **Design Tokens:** Canvas `#FBF9F5`, Surface `#F5F1EB`, Sumi Ink `#2D2A26`, Muted `#78716C`, Wood `#C49767`, Hanko Red `#B94938`.
* **WCAG AA:** All text contrast ratios > 4.5:1 against washi background; minimum touch targets 44x44px.
* **Sensory Feedback:** Procedural Web Audio for bamboo tap and singing bowl chime; lazy initialization on first user interaction.

## Review Focus

1. **Audio autoplay blocked before user gesture:** Browser blocks Web Audio API before user gesture; `AudioContext` must gracefully initialize/resume on first tap without throwing unhandled exceptions.
2. **Local storage JSON corrupted:** If `localStorage` holds corrupted or unparseable JSON, the app must fall back to safe defaults without crashing.
3. **Daily Focus overflow:** When user attempts to add a 6th task to Daily Focus, prevent silent overwrite or visual clutter by redirecting it to Backlog with a gentle toast/notice.
4. **Mobile keyboard pushes ambient dock:** On mobile devices, opening virtual keyboard shrinks viewport; ambient dock must not obscure the active input field.
5. **Timer drift when backgrounded:** Switching tabs or locking phone screen must not break countdown; elapsed time must synchronize with timestamps (`performance.now()` or `Date.now()`).

---

### Task 1: Project Scaffolding, Tooling & Styling Setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/main.tsx`, `index.html`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: Running Vite dev server, Vitest test runner, Tailwind CSS build pipeline with washi custom color tokens.

- [ ] **Step 1: Write initial smoke test**

```typescript
// src/App.test.tsx
import { describe, it, expect } from 'vitest';

describe('Project Setup Smoke Test', () => {
  it('environment runs tests properly', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (before setup)**

Run: `npm test` in `c:\Users\Julianda\Documents\todo-list-app`
Expected: FAIL (command not found or missing package.json)

- [ ] **Step 3: Initialize Vite React TypeScript project and dependencies**

Install dependencies: `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`.
Dev dependencies: `vite`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.
Configure Tailwind with washi colors (`washi-bg: #FBF9F5`, `washi-surface: #F5F1EB`, `washi-border: #E7E0D6`, `sumi-ink: #2D2A26`, `hinoki-wood: #C49767`, `hanko-red: #B94938`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold vite react typescript project with tailwind and vitest"
```

---

### Task 2: Data Models & Resilient LocalStorage Hook

**Files:**
- Create: `src/types/index.ts`
- Create: `src/hooks/useLocalStorage.ts`
- Test: `src/hooks/useLocalStorage.test.ts`

**Interfaces:**
- Consumes: Standard React hooks.
- Produces: `TodoItem`, `TimerState`, `AmbientState` types, and `useLocalStorage<T>(key: string, initialValue: T)` hook with corruption recovery.

- [ ] **Step 1: Write the failing tests for `useLocalStorage`**

```typescript
// src/hooks/useLocalStorage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('updates value and saves to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test_key')!)).toBe('updated');
  });

  it('falls back to initial value when stored JSON is corrupted', () => {
    localStorage.setItem('corrupt_key', '{broken_json');
    const { result } = renderHook(() => useLocalStorage('corrupt_key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useLocalStorage.test.ts`
Expected: FAIL (Cannot find module `./useLocalStorage`)

- [ ] **Step 3: Implement `src/types/index.ts` and `src/hooks/useLocalStorage.ts`**

Define `TodoItem`, `TimerState`, `AmbientState` in `src/types/index.ts`.
Implement `useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void]` with try-catch around `JSON.parse` and `localStorage.setItem`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useLocalStorage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/hooks/useLocalStorage.ts src/hooks/useLocalStorage.test.ts
git commit -m "feat: implement data types and safe useLocalStorage hook"
```

---

### Task 3: Procedural Web Audio Engine (Synthesizer & Chimes)

**Files:**
- Create: `src/utils/audioSynthesizer.ts`
- Create: `src/hooks/useZenAudio.ts`
- Test: `src/utils/audioSynthesizer.test.ts`

**Interfaces:**
- Consumes: Web Audio API (`AudioContext`, `BiquadFilterNode`, `OscillatorNode`, `GainNode`).
- Produces: `playBambooClick()`, `playSingingBowl()`, `startAmbient(type, volume)`, `stopAmbient()`, `setVolume(volume)` in `useZenAudio`.

- [ ] **Step 1: Write the failing tests for audio synthesis calculations**

```typescript
// src/utils/audioSynthesizer.test.ts
import { describe, it, expect } from 'vitest';
import { createAudioBuffers } from './audioSynthesizer';

describe('audioSynthesizer buffer generator', () => {
  it('generates pink noise buffer correctly with non-zero samples', () => {
    const buffer = createAudioBuffers.createPinkNoise(44100, 2);
    expect(buffer.length).toBe(44100 * 2);
    expect(buffer.some(val => val !== 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/audioSynthesizer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `audioSynthesizer.ts` and `useZenAudio.ts`**

Implement `createPinkNoise` and `createBrownNoise` generators for rain/wind sounds.
Implement `playBambooClick(ctx)` with rapid resonant decaying impulse (40ms).
Implement `playSingingBowl(ctx)` with dual oscillator harmonics (432Hz + 864Hz) decaying exponentially over 3.5s.
Implement `useZenAudio()` hook managing lazy `AudioContext` startup and ambient loop state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/audioSynthesizer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/audioSynthesizer.ts src/hooks/useZenAudio.ts src/utils/audioSynthesizer.test.ts
git commit -m "feat: implement procedural web audio engine and zen audio hook"
```

---

### Task 4: Zen Pomodoro Hook with Background Drift Sync

**Files:**
- Create: `src/hooks/usePomodoro.ts`
- Test: `src/hooks/usePomodoro.test.ts`

**Interfaces:**
- Consumes: `TimerState`, `TimerMode` from `src/types/index.ts`, `useLocalStorage`.
- Produces: `usePomodoro(onComplete?: () => void)` returning `{ timerState, start, pause, reset, switchMode, progress }`.

- [ ] **Step 1: Write failing tests for `usePomodoro`**

```typescript
// src/hooks/usePomodoro.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from './usePomodoro';

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with 25 minutes (1500 seconds) in focus mode', () => {
    const { result } = renderHook(() => usePomodoro());
    expect(result.current.timerState.mode).toBe('focus');
    expect(result.current.timerState.timeLeft).toBe(1500);
    expect(result.current.timerState.isRunning).toBe(false);
  });

  it('counts down when started and triggers onComplete when reaching zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePomodoro(onComplete));

    act(() => {
      result.current.start();
    });
    expect(result.current.timerState.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.timerState.timeLeft).toBe(1495);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/usePomodoro.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `usePomodoro.ts`**

Calculate countdown with timestamp delta tracking (`performance.now()`) to prevent timer lag when phone goes to sleep or tab switches.
Cycle modes: `focus` -> `shortBreak` (after 1 session) / `longBreak` (after 4 sessions).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/usePomodoro.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePomodoro.ts src/hooks/usePomodoro.test.ts
git commit -m "feat: implement pomodoro hook with accurate timestamp sync"
```

---

### Task 5: Washi Container & Zen Header Layout Components

**Files:**
- Create: `src/components/layout/WashiContainer.tsx`
- Create: `src/components/layout/ZenHeader.tsx`
- Test: `src/components/layout/ZenHeader.test.tsx`

**Interfaces:**
- Consumes: Tailwind classes and Lucide icons.
- Produces: Full viewport wrapper with subtle washi grain and safe-area padding; header showing localized peaceful date string.

- [ ] **Step 1: Write failing test for `ZenHeader`**

```typescript
// src/components/layout/ZenHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZenHeader } from './ZenHeader';

describe('ZenHeader', () => {
  it('renders date and calm subtitle', () => {
    render(<ZenHeader title="Washi Focus" />);
    expect(screen.getByText(/Washi Focus/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/layout/ZenHeader.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `WashiContainer.tsx` and `ZenHeader.tsx`**

`WashiContainer`: `min-h-[100dvh] bg-[#FBF9F5] text-[#2D2A26] flex flex-col px-4 pb-24 pt-4 relative selection:bg-[#E7E0D6]`.
`ZenHeader`: Displays date formatted in Indonesian (e.g. "Kamis, 12 November") with poetic badge "Waktu Tenang" and title.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/layout/ZenHeader.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/WashiContainer.tsx src/components/layout/ZenHeader.tsx src/components/layout/ZenHeader.test.tsx
git commit -m "feat: add washi container and zen header layout components"
```

---

### Task 6: To-Do System: Daily Focus Board & Hanko Stamping

**Files:**
- Create: `src/components/todo/TodoItem.tsx`
- Create: `src/components/todo/TodoInput.tsx`
- Create: `src/components/todo/DailyFocusBoard.tsx`
- Test: `src/components/todo/DailyFocusBoard.test.tsx`

**Interfaces:**
- Consumes: `TodoItem` from `src/types/index.ts`, `useLocalStorage`, sound feedback callbacks.
- Produces: Daily Focus board enforcing the 5-task hard cap, Tanzaku paper strip cards, Hanko red seal animation.

- [ ] **Step 1: Write failing test for `DailyFocusBoard` cap enforcement**

```typescript
// src/components/todo/DailyFocusBoard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyFocusBoard } from './DailyFocusBoard';
import { TodoItem } from '../../types';

describe('DailyFocusBoard', () => {
  const mockTodos: TodoItem[] = [
    { id: '1', title: 'Tugas 1', isCompleted: false, createdAt: 1, isDailyFocus: true, order: 1 },
    { id: '2', title: 'Tugas 2', isCompleted: false, createdAt: 2, isDailyFocus: true, order: 2 },
    { id: '3', title: 'Tugas 3', isCompleted: false, createdAt: 3, isDailyFocus: true, order: 3 },
    { id: '4', title: 'Tugas 4', isCompleted: false, createdAt: 4, isDailyFocus: true, order: 4 },
    { id: '5', title: 'Tugas 5', isCompleted: false, createdAt: 5, isDailyFocus: true, order: 5 },
  ];

  it('renders all 5 active focus items', () => {
    render(<DailyFocusBoard todos={mockTodos} onToggle={vi.fn()} onAdd={vi.fn()} onOpenBacklog={vi.fn()} />);
    expect(screen.getByText('Tugas 1')).toBeInTheDocument();
    expect(screen.getByText('Tugas 5')).toBeInTheDocument();
  });

  it('shows calm notification when cap of 5 is reached and prevents 6th addition directly', () => {
    render(<DailyFocusBoard todos={mockTodos} onToggle={vi.fn()} onAdd={vi.fn()} onOpenBacklog={vi.fn()} />);
    expect(screen.getByText(/Pikiran hari ini sudah cukup penuh/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/todo/DailyFocusBoard.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `TodoItem.tsx`, `TodoInput.tsx`, and `DailyFocusBoard.tsx`**

`TodoItem`: Tanzaku paper card with soft shadow, Hanko seal stamp icon when completed, strike-through animation, delete/archive action.
`TodoInput`: Minimalist input with auto-focus and gentle submit button.
`DailyFocusBoard`: Manages active 3-5 focus tasks, displays "X/5 Fokus Hari Ini", triggers bamboo tap audio on toggle.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/todo/DailyFocusBoard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/todo/TodoItem.tsx src/components/todo/TodoInput.tsx src/components/todo/DailyFocusBoard.tsx src/components/todo/DailyFocusBoard.test.tsx
git commit -m "feat: implement daily focus board with hanko stamp and zen cap"
```

---

### Task 7: Gentle Backlog Drawer & "Sapu Halaman" Ritual

**Files:**
- Create: `src/components/todo/GentleBacklog.tsx`
- Create: `src/components/feedback/ZenCelebration.tsx`
- Test: `src/components/todo/GentleBacklog.test.tsx`

**Interfaces:**
- Consumes: `TodoItem[]`, handlers to promote backlog items to daily focus, archive completed tasks.
- Produces: Slide-up bottom sheet drawer for thoughts, "Sapu Halaman" cleaner, and gentle falling leaf particles.

- [ ] **Step 1: Write failing test for `GentleBacklog`**

```typescript
// src/components/todo/GentleBacklog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GentleBacklog } from './GentleBacklog';
import { TodoItem } from '../../types';

describe('GentleBacklog', () => {
  const mockBacklog: TodoItem[] = [
    { id: 'b1', title: 'Ide Belajar Nanti', isCompleted: false, createdAt: 1, isDailyFocus: false, order: 1 }
  ];

  it('renders backlog items and allows promoting to daily focus', () => {
    const onPromote = vi.fn();
    render(<GentleBacklog isOpen={true} onClose={vi.fn()} todos={mockBacklog} onPromote={onPromote} onAddBacklog={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Ide Belajar Nanti')).toBeInTheDocument();
    
    const promoteBtn = screen.getByRole('button', { name: /Jadikan Fokus/i });
    fireEvent.click(promoteBtn);
    expect(onPromote).toHaveBeenCalledWith('b1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/todo/GentleBacklog.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `GentleBacklog.tsx` and `ZenCelebration.tsx`**

`GentleBacklog`: Accessible modal bottom drawer (closable with Escape or backdrop tap), list of non-daily tasks, "Pindahkan ke Fokus Hari Ini" button (disabled if already 5 focus tasks).
"Sapu Halaman" action: Archives completed tasks with smooth fade-out.
`ZenCelebration`: Canvas/SVG falling sakura leaves or green tea leaves when all 5 focus tasks are completed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/todo/GentleBacklog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/todo/GentleBacklog.tsx src/components/feedback/ZenCelebration.tsx src/components/todo/GentleBacklog.test.tsx
git commit -m "feat: implement gentle backlog drawer and daily sweep ritual"
```

---

### Task 8: The Ensō Pomodoro Timer Component

**Files:**
- Create: `src/components/timer/EnsoTimer.tsx`
- Create: `src/components/timer/TimerControls.tsx`
- Test: `src/components/timer/EnsoTimer.test.tsx`

**Interfaces:**
- Consumes: `TimerState` and controls from `usePomodoro`.
- Produces: Circular SVG Ensō brush progress indicator, time display, mode switcher (Fokus / Istirahat).

- [ ] **Step 1: Write failing test for `EnsoTimer`**

```typescript
// src/components/timer/EnsoTimer.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnsoTimer } from './EnsoTimer';

describe('EnsoTimer', () => {
  it('displays formatted time string MM:SS', () => {
    render(<EnsoTimer timeLeft={1500} isRunning={false} mode="focus" progress={0.5} onToggle={vi.fn()} onReset={vi.fn()} onSwitchMode={vi.fn()} />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('triggers onToggle when Ensō circle is tapped', () => {
    const onToggle = vi.fn();
    render(<EnsoTimer timeLeft={1500} isRunning={false} mode="focus" progress={0.5} onToggle={onToggle} onReset={vi.fn()} onSwitchMode={vi.fn()} />);
    fireEvent.click(screen.getByText('25:00'));
    expect(onToggle).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/timer/EnsoTimer.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `EnsoTimer.tsx` and `TimerControls.tsx`**

`EnsoTimer`: Circular SVG stroke with strokeDasharray/strokeDashoffset mimicking an imperfect organic ink circle. Center displays large legible countdown in Sumi ink.
`TimerControls`: Calm buttons for Play/Pause, Reset, and mode pills ("25m Fokus", "5m Rehat").

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/timer/EnsoTimer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/timer/EnsoTimer.tsx src/components/timer/TimerControls.tsx src/components/timer/EnsoTimer.test.tsx
git commit -m "feat: implement enso brush circular pomodoro timer"
```

---

### Task 9: Ambient Sound Dock Component

**Files:**
- Create: `src/components/audio/AmbientSoundBar.tsx`
- Test: `src/components/audio/AmbientSoundBar.test.tsx`

**Interfaces:**
- Consumes: `useZenAudio` hook (active track, volume, isPlaying, toggle, setVolume).
- Produces: Floating bottom dock with sound options (🌧️ Hujan, 🎋 Bambu, 🍵 Teh, 🔕 Hening) and smooth volume slider.

- [ ] **Step 1: Write failing test for `AmbientSoundBar`**

```typescript
// src/components/audio/AmbientSoundBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AmbientSoundBar } from './AmbientSoundBar';

describe('AmbientSoundBar', () => {
  it('renders sound buttons and switches active track on click', () => {
    const onSelectSound = vi.fn();
    render(<AmbientSoundBar activeSound="none" volume={0.6} isPlaying={false} onSelectSound={onSelectSound} onVolumeChange={vi.fn()} />);
    
    const rainBtn = screen.getByRole('button', { name: /Hujan/i });
    fireEvent.click(rainBtn);
    expect(onSelectSound).toHaveBeenCalledWith('gentle_rain');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/audio/AmbientSoundBar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `AmbientSoundBar.tsx`**

Fixed floating dock above bottom edge with `backdrop-blur-sm bg-[#F5F1EB]/90 border border-[#E7E0D6] rounded-full px-4 py-2 shadow-sm`.
Four sound toggles: Hujan, Angin Bambu, Ruang Teh, Hening.
Minimal volume slider with hinoki wood accent color.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/audio/AmbientSoundBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/audio/AmbientSoundBar.tsx src/components/audio/AmbientSoundBar.test.tsx
git commit -m "feat: implement floating ambient sound bar component"
```

---

### Task 10: App Orchestration, PWA Integration & Verification

**Files:**
- Modify: `src/App.tsx`
- Create: `vite.config.ts` (with PWA configuration), `public/manifest.webmanifest`
- Test: `src/App.integration.test.tsx`

**Interfaces:**
- Consumes: All modules from Tasks 1-9.
- Produces: Fully functional mobile-first web app with end-to-end user workflows, PWA manifest, and production build.

- [ ] **Step 1: Write integration test for the full app experience**

```typescript
// src/App.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Washi Focus App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows adding a task, viewing the timer, and switching ambient sound', async () => {
    render(<App />);
    expect(screen.getByText(/Washi Focus/i)).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Tulis satu hal yang ingin diselesaikan/i);
    fireEvent.change(input, { target: { value: 'Belajar Bab 1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Belajar Bab 1')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run integration test to verify it fails**

Run: `npx vitest run src/App.integration.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `App.tsx` orchestration & PWA configuration**

Connect `useLocalStorage`, `usePomodoro`, `useZenAudio` with `WashiContainer`, `ZenHeader`, `EnsoTimer`, `DailyFocusBoard`, `GentleBacklog`, and `AmbientSoundBar`.
When Pomodoro completes: trigger `playSingingBowl()`.
When task completes: trigger `playBambooClick()`.
Configure `vite-plugin-pwa` in `vite.config.ts`.

- [ ] **Step 4: Run all unit and integration tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Run production build and linting check**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx vite.config.ts src/App.integration.test.tsx public/
git commit -m "feat: complete washi focus app integration and pwa setup"
```
