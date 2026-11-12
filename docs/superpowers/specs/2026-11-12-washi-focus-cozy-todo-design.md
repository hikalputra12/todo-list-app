# Design Specification: Washi Focus (和紙フォーカス)
**Cozy Japanese Minimalist To-Do & Study Companion App**

* **Date:** 2026-11-12
* **Status:** Approved Draft
* **Platform:** Mobile-First Web Application (PWA ready)
* **Target Repository:** `c:\Users\Julianda\Documents\todo-list-app`

---

## 1. Overview & Vision

**Washi Focus** is an intentional, calm, and distraction-free daily to-do and companion application. Inspired by Japanese minimalism and *washi* (traditional Japanese paper aesthetics), it is designed specifically for students and knowledge workers who want a peaceful desk companion on their smartphone during study and work sessions.

Unlike conventional to-do apps that induce anxiety with endless backlogs, high-urgency notifications, and complex prioritization matrices, Washi Focus embraces **calm productivity**:
1. **Daily Zen Cap:** Strictly limits active daily focus to 3–5 meaningful tasks to prevent cognitive overload.
2. **Gentle Sensory Feedback:** Uses gentle wood taps (*bamboo click*) and meditative singing bowl chimes (*rin gong*) instead of harsh alarms.
3. **Built-in Ambient Sound:** Integrated offline audio generator (rain, bamboo wind, tea room) powered directly by the browser's Web Audio API.
4. **100% Local & Private:** Zero account requirement, instant launch, and fully offline-capable via LocalStorage.

---

## 2. Technical Stack & Architecture

### 2.1 Dependencies
* **Core:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS (configured with custom Washi design tokens and paper grain filters)
* **Icons:** Lucide React (clean stroke width) & Custom Zen SVGs (Ensō circle, Hanko stamp)
* **Audio Engine:** HTML5 Web Audio API (native browser synthesis & oscillator-based chime generator, zero external streaming dependency)
* **PWA & Offline:** `vite-plugin-pwa` for Service Worker caching and home-screen installability
* **Testing:** Vitest + React Testing Library

### 2.2 Directory & Component Hierarchy
```text
c:\Users\Julianda\Documents\todo-list-app/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-11-12-washi-focus-cozy-todo-design.md
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── assets/
│   │   └── textures/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── WashiContainer.tsx      # Main viewport shell (100dvh, safe-area padding)
│   │   │   └── ZenHeader.tsx           # Poetic date header ("Kamis, 12 Nov • Waktu Tenang")
│   │   ├── todo/
│   │   │   ├── DailyFocusBoard.tsx     # 3-5 daily task list (Tanzaku paper strips)
│   │   │   ├── TodoItem.tsx            # Task row with Hanko ink-stamp check animation
│   │   │   ├── TodoInput.tsx           # Minimalist task entry input
│   │   │   └── GentleBacklog.tsx       # Bottom sheet drawer for "Pikiran Tersimpan"
│   │   ├── timer/
│   │   │   ├── EnsoTimer.tsx           # Circular calligraphy brush timer
│   │   │   └── TimerControls.tsx       # Minimalist start/pause/reset buttons
│   │   ├── audio/
│   │   │   └── AmbientSoundBar.tsx     # Bottom sound selector & volume slider dock
│   │   └── feedback/
│   │       └── ZenCelebration.tsx      # Gentle falling leaf / blossom animation
│   ├── hooks/
│   │   ├── useLocalStorage.ts          # Safe typed reactive local storage hook
│   │   ├── useZenAudio.ts              # Web Audio API engine (synthesizer + chime)
│   │   └── usePomodoro.ts              # Timer logic with focus/break cycle management
│   ├── types/
│   │   └── index.ts                    # TodoItem, TimerState, AmbientState interfaces
│   ├── utils/
│   │   └── audioSynthesizer.ts         # Procedural white/pink noise & singing bowl synth
│   ├── App.tsx                         # Root app orchestrator
│   ├── main.tsx                        # React DOM entry
│   └── index.css                       # Washi paper background styling & custom animations
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Data Models & State Management

### 3.1 TypeScript Schemas
```typescript
export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  isDailyFocus: boolean; // true = 3-5 Fokus Hari Ini, false = Pikiran Tersimpan (Backlog)
  order: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number;        // In seconds (e.g. 1500 for 25m)
  isRunning: boolean;
  sessionsCompleted: number;
  settings: {
    focusDuration: number;      // 25 minutes default
    shortBreakDuration: number; // 5 minutes default
    longBreakDuration: number;  // 15 minutes default
  };
}

export type AmbientSoundType = 'none' | 'gentle_rain' | 'bamboo_wind' | 'tea_room' | 'temple_stream';

export interface AmbientState {
  activeSound: AmbientSoundType;
  volume: number; // 0.0 to 1.0 (default: 0.6)
  isPlaying: boolean;
}
```

### 3.2 Storage Keys & Migration
* `washi_todos_v1`: JSON array of `TodoItem`.
* `washi_timer_settings_v1`: JSON object storing `TimerState.settings`.
* `washi_ambient_settings_v1`: JSON object storing last chosen `volume` and `activeSound`.
* Automatic corruption handling: If JSON parsing fails on load, data falls back gracefully to default empty values and logs an inline recovery warning without crashing the UI.

### 3.3 State Rules & Constraints
1. **Zen Daily Cap:** A maximum of **5 active tasks** can have `isDailyFocus: true` at any given time.
   * If a user attempts to add a 6th task directly to Daily Focus, an inline gentle dialog suggests moving it to *"Pikiran Tersimpan"* (Backlog).
2. **Ritual "Sapu Halaman" (*Daily Sweep*):**
   * When tasks are marked complete, they remain visible with a subtle strikethrough and red Hanko stamp.
   * An unobtrusive "Sapu Halaman" button clears finished tasks into history or archive smoothly.

---

## 4. UI/UX Design System & Sensory Interactions

### 4.1 Design Tokens (*Washi Palette*)
* **Canvas Background:** `#FBF9F5` (warm washi paper with delicate paper fiber noise)
* **Surface Card:** `#F5F1EB` (light rice paper with `#E7E0D6` 1px border)
* **Sumi Ink Text:** `#2D2A26` (soft calligraphy charcoal black, high contrast yet gentle on eyes)
* **Muted Stone:** `#78716C` (secondary text and subtle timestamps)
* **Hinoki Wood Accent:** `#C49767` (active buttons, timer progress track)
* **Hanko Red Stamp:** `#B94938` (traditional vermilion red for completion checkmark & active focus indicators)

### 4.2 Mobile-First Viewport Flow
1. **Header:** Displays today's date in a serene format (e.g., *"Kamis, 12 Nov • Waktu Tenang"*) and a subtle toggle for full-screen focus mode.
2. **The Ensō Timer:** Circular canvas or SVG timer mimicking a traditional Japanese Zen circle. Tapping the center toggles timer start/pause.
3. **Daily Focus Board (Tanzaku strips):**
   * List of 3–5 items displayed as delicate paper strips.
   * Checkbox tap triggers:
     1. Stamping sound (short 40ms wooden bamboo tap via Web Audio).
     2. Visual red Hanko seal fading in with slight organic tilt (-2° to +2°).
     3. Gentle strikethrough.
4. **Bottom Ambient Dock:**
   * Floating dock at bottom with safe-area spacing.
   * Sound chips: 🌧️ Hujan Rintik, 🎋 Angin Bambu, 🍵 Suasana Teh.
   * Compact volume slider.
5. **Gentle Backlog Drawer:**
   * Swipe-up or tap on *"Pikiran Tersimpan (N items)"* slides up a calm modal drawer to review or promote tasks into today's focus.

---

## 5. Audio Synthesizer Architecture

Rather than relying on external large MP3 assets that can fail when offline or incur network latency:
* **Web Audio API Procedural Generation:**
  * **Gentle Rain:** Pink/Brown noise filtered through low-pass biquad filters with subtle modulation.
  * **Bamboo Wind:** Band-pass filtered white noise with gentle LFO oscillator panning.
  * **Singing Bowl Chime:** Dual sine wave oscillators (fundamental frequency ~432Hz + 864Hz harmonic) with exponential amplitude decay over 3.5 seconds.
  * **Bamboo Wood Click:** High-frequency resonant impulse decay for satisfying tactile feedback on task completion.

---

## 6. Error Handling & Resilience

* **Autoplay Policy Handling:** Browser `AudioContext` is suspended initially and automatically resumed upon the first user interaction (touch/click).
* **Storage Guardrails:** Quota checks and schema validation ensure corrupted local data never produces a blank screen.
* **Viewport Adaptability:** Styles use `100dvh` and CSS safe-area padding (`env(safe-area-inset-bottom)`) to guarantee the bottom sound bar never clashes with mobile OS swipe gestures.
* **Accessibility (WCAG AA):**
  * All text contrast ratios exceed 4.5:1 against the washi background.
  * All touch targets meet or exceed 44x44px.
  * Complete keyboard navigation (`Tab`, `Space`, `Enter`, `Escape` for backlog drawer).

---

## 7. Testing & Quality Assurance

* **Unit Testing (Vitest):**
  * `useLocalStorage`: validates persistence, retrieval, corruption recovery, and state updates.
  * `usePomodoro`: validates countdown accuracy, state transitions between focus and short/long break, and pause/reset mechanisms.
  * `DailyFocusBoard`: ensures the 5-task hard cap is enforced and task promotion from backlog works seamlessly.
* **Audio Smoke Tests:**
  * Validates `AudioContext` initialization and audio synthesis functions without unhandled exceptions.
* **Build & Bundle Verification:**
  * Strict TypeScript checks (`tsc --noEmit`).
  * Vite production build with zero warnings.
