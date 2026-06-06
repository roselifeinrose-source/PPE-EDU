# AGENTS.md — PPE Informatique

- proiritize existing components and utilities over creating new ones, unless there's a clear gap that needs to be filled.
- don't update translations unless i asked you to update it.

## GIT workflow

- if i asked you to push to github, run this prompt `.agents\skills\git-workflow-agent\SKILL.md`
- always create a new branch for push.
- branch naming convention: `DEV{next_number}` for development branches (sequential: DEV11, DEV12, DEV13, ...) if exist jump it, `DEV{number}_{small_description}` for small changes (e.g., `DEV13_fix_login_bug`).

## Quick start

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # production build
npm run lint     # ESLint on all .js/.jsx
npm run preview  # preview production build
```

No test framework is configured. No typecheck step exists (plain JSX, no TypeScript).

## Architecture

- **Framework:** React 19 + Vite 8 (SFCs, no TypeScript)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin (NOT PostCSS). Dark mode is class-based: toggle `.dark` on `<html>` (see `src/index.css` `@custom-variant dark`). Palette is slate + indigo. Use `bg-white dark:bg-slate-800`, `text-slate-900 dark:text-slate-100`, `bg-indigo-600`, etc.
- **State:** Zustand stores at `src/store/`. `useGameStore` uses `persist` middleware → localStorage key `ppe-game-store`. `useAuthStore` is NOT persisted. `useSettingsStore` persists to `ppe-settings`.
- **Routing:** React Router v7. Routes in `src/App.jsx`: `/` redirects based on role, `/teacher`, `/teacher/analytics`, `/dashboard`, `/leaderboard`. MainLayout wraps all routes (top header + content).
- **No backend.** All state is client-side. AI content generation via Gemini API at `src/utils/aiService.js`.
- **Env:** Create `.env` at root with `VITE_GEMINI_API_KEY=your_key` to use real AI generation. Falls back to mock data if missing.

## Constants (`src/constants.js`)

- **`XP_PER_LEVEL`** = `300` — used everywhere (Navbar, StudentDashboard, useGameStore) to avoid magic numbers.

## Data models (useGameStore)

- **students:** `[{ id, name, totalXP, level, completedGames: [{ gameId, score, xpGained, date }] }]`
- **games:** `[{ id, title, subject: "Informatique", topic, gameType: "quiz"|"puzzle"|"sequencing", content, analytics: { attempts, averageScore, failedConcepts } }]`
- Key actions: `addGame(game)`, `submitGameResult(studentId, gameId, score, xpGained, failedConceptNames?)` auto-calculates XP/level and analytics. The optional `failedConceptNames` array is merged into `game.analytics.failedConcepts` (unique).

## Game content shape

| gameType    | content key    | structure                                        |
|-------------|----------------|--------------------------------------------------|
| `quiz`      | `questions`    | `{ id, question, options[], correctIndex, concept? }` |
| `puzzle`    | `pairs`        | `{ id, left, right }`                            |
| `sequencing`| `steps`        | `{ id, order, text }`                            |

## Conventions

- Components use `.jsx` extension, stores/utils use `.js`
- Lucide React for icons — import by name, e.g. `import { Zap } from 'lucide-react'`
- All UI text is in French (target: Moroccan middle school students)
- Role toggle lives in `Navbar` — switches between `teacher` and `student` views for testing
- `aiService.js` and `ChatBot.jsx` call the Gemini API with model `gemini-3.5-flash` if `VITE_GEMINI_API_KEY` env var is set, otherwise falls back to mock data
- Theme switch uses `useSettingsStore` + `useTheme` hook; header has Sun/Moon toggle button
