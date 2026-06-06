# Implementation Plan: Teacher UI Sidebar Refactor

## Overview

Refactor the monolithic TeacherDashboard (859 lines) and TeacherAnalytics (286 lines) into a sidebar + multi-route architecture. The existing top-Navbar layout is preserved for student pages; teacher pages get a new `TeacherLayout` with a collapsible sidebar.

---

## File Structure (Target)

```
src/
  layouts/
    TeacherLayout.jsx       ← NEW - sidebar + Outlet wrapper
  components/
    TeacherSidebar.jsx      ← NEW - collapsible sidebar nav
    GameCard.jsx            ← NEW - grid-view card for Games page
    GameRow.jsx             ← NEW - list-view row for Games page
    MetricCard.jsx          ← NEW - reusable stat card (extracted from inline)
    MainLayout.jsx          ← EXISTING - unchanged
    Navbar.jsx              ← EXISTING - unchanged (still renders for student routes)
    GroupManager.jsx        ← EXISTING - reused in Groups.jsx
    GlobalClassStats.jsx    ← EXISTING - reused in Dashboard.jsx
    ...all others unchanged
  pages/
    teacher/
      Dashboard.jsx         ← NEW - slim overview (metric cards + groups + stats)
      Games.jsx             ← NEW - full game library with grid/list + below-fold sections
      CreateGame.jsx        ← NEW - wizard-style creation page
      Analytics.jsx         ← NEW - tabbed analytics (Overview / Students / AI)
      Groups.jsx            ← NEW - full group & student management
  dashboards/
    TeacherDashboard.jsx    ← DELETED (replaced by pages/teacher/*)
    TeacherAnalytics.jsx    ← DELETED (replaced by pages/teacher/Analytics.jsx)
    StudentDashboard.jsx    ← UNCHANGED
    StudentLeaderboard.jsx  ← UNCHANGED
  App.jsx                   ← MODIFIED - add nested /teacher/* routes
  index.css                 ← UNCHANGED (add sidebar utility classes only)
```

---

## Step 1: Create `src/components/MetricCard.jsx`

**Purpose:** Extract the repeated metric card pattern (icon + label + value) used in both dashboards.

**Props:**
- `icon` (lucide component)
- `label` (string)
- `value` (string/number)
- `color` ('indigo' | 'emerald' | 'amber' | 'red' | 'purple') - determines icon bg color

**Structure:**
```jsx
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-8 h-8 rounded-lg bg-${color}-50 dark:bg-${color}-900/30 flex items-center justify-center`}>
      <Icon size={16} className={`text-${color}-600 dark:text-${color}-400`} />
    </div>
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
  </div>
  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
</div>
```

---

## Step 2: Create `src/components/TeacherSidebar.jsx`

**Purpose:** Collapsible left sidebar for teacher routes.

**Props:**
- `collapsed` (boolean)
- `onToggle` (callback)

**Items:**
| Label | Path | Icon |
|---|---|---|
| Tableau de Bord | /teacher/dashboard | LayoutDashboard |
| Mes Jeux | /teacher/games | Gamepad2 |
| Créer un Jeu | /teacher/create | PlusCircle |
| Analytiques | /teacher/analytics | BarChart3 |
| Groupes & Élèves | /teacher/groups | Users |
| Paramètres | (opens SettingsModal) | Settings |

**Behavior:**
- Collapsed: width `w-14` (56px), icons only, tooltips via `title` attr
- Expanded: width `w-56` (220px), icon + label
- Toggle button: `ChevronLeft` / `ChevronRight` at top
- Active route highlighted with `bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300`
- Collapsed state persisted in `localStorage` key `teacher_sidebar_collapsed`
- "Paramètres" item opens SettingsModal (lifted state via callback or use `useSettingsStore`)
- Fixed left position, full height minus top navbar
- Background: `bg-slate-50 dark:bg-slate-800/50` with right border
- z-index: `z-30` (below navbar z-40, above content)

**Styling:**
- Each item: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200`
- Inactive: `text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50`
- Active: `bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300`
- When collapsed, center icons and add `justify-center`

---

## Step 3: Create `src/layouts/TeacherLayout.jsx`

**Purpose:** Wrapper layout for all teacher routes. Renders Navbar + Sidebar + Outlet.

**Structure:**
```jsx
export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('teacher_sidebar_collapsed') === 'true')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('teacher_sidebar_collapsed', String(next))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="flex pt-16"> {/* pt-16 = navbar height */}
        <TeacherSidebar collapsed={collapsed} onToggle={toggleSidebar} onSettings={() => setSettingsOpen(true)} />
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-14' : 'ml-56'}`}>
          <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
```

**Key details:**
- The `<Navbar />` stays at the top (sticky, z-40)
- Sidebar is fixed left, content area uses margin-left to offset
- Content area has `h-[calc(100vh-4rem)] overflow-y-auto` for viewport-height scroll
- The `SettingsModal` is rendered here so the sidebar "Paramètres" button can open it

---

## Step 4: Create `src/components/GameCard.jsx`

**Purpose:** Card component for grid view in Games page.

**Props:**
- `game` (game object)
- `onPreview`, `onEdit`, `onDelete`, `onDuplicate`, `onArchive`, `onSession`, `onPresent`
- `selected` (boolean)
- `onToggleSelect`

**Structure:**
```jsx
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-all">
  {/* Checkbox + Title + Type Badge */}
  {/* Topic tag + Difficulty stars + Date */}
  {/* Analytics: attempts + avg score */}
  {/* Action row: Tester, Session, Projeter, Modifier, Dupliquer, Archiver, Supprimer */}
</div>
```

**Game type color badge map (Tailwind classes):**
| Type | Badge BG | Badge Text |
|---|---|---|
| quiz | `bg-purple-100 dark:bg-purple-900/30` | `text-purple-700 dark:text-purple-300` |
| puzzle | `bg-blue-100 dark:bg-blue-900/30` | `text-blue-700 dark:text-blue-300` |
| sequencing | `bg-teal-100 dark:bg-teal-900/30` | `text-teal-700 dark:text-teal-300` |
| memory | `bg-amber-100 dark:bg-amber-900/30` | `text-amber-700 dark:text-amber-300` |
| cloze | `bg-green-100 dark:bg-green-900/30` | `text-green-700 dark:text-green-300` |
| dropping | `bg-orange-100 dark:bg-orange-900/30` | `text-orange-700 dark:text-orange-300` |

---

## Step 5: Create `src/components/GameRow.jsx`

**Purpose:** Compact list row for list view in Games page.

**Props:** Same as GameCard.

**Structure:** Single flex row with:
- Checkbox | Title | Type badge | Topic | Date | Attempts | Avg Score | Actions (icon buttons)

---

## Step 6: Create `src/pages/teacher/Dashboard.jsx`

**Purpose:** Top-level overview only. No scrolling needed.

**Content:**
1. 3x MetricCard: Jeux Créés, Élèves Actifs, Score Moyen
2. 2-column grid: GroupManager (left) + GlobalClassStats (right)

**State:** Reads from `useGameStore` only (games, students). Computes `avgScore`.

**No modals, no forms, no game list.** Pure summary.

---

## Step 7: Create `src/pages/teacher/Games.jsx`

**Purpose:** Full game library management. Replaces the bulk of TeacherDashboard.

**State (all `useState`):**
- `searchQuery`, `filterType`, `viewMode` ('grid'|'list', persisted in localStorage `games_view`)
- `editingId`, `editTitle`, `editTopic`, `editContent`, `editComment`
- `deletingGame`, `selectedIds`, `showArchived`
- `previewId`, `showSession`, `sessionGameId`, `showPresentation`

**Sections (top to bottom, all in scrollable content area):**

1. **Toolbar row:**
   - Search input
   - Filter dropdown (Tous/Quiz/Puzzle/Séquencement/Memory/Texte à trous/Tri par chute)
   - View toggle (GridLayout / List icons)
   - Export JSON button
   - Export QTI button
   - Archives toggle

2. **Game list:**
   - Empty state if no games
   - Grid view: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` of GameCard
   - List view: vertical stack of GameRow

3. **Below the list:**
   - PublicationCalendar
   - FogMode
   - ActivityLogs
   - ManualGrading

4. **Student quiz moderation** (conditional)

5. **Modals:**
   - SessionDashboard (conditional)
   - PresentationMode (conditional)
   - DeleteConfirmModal
   - GenerationModal (for simulation warnings)

**Game preview:** If `previewId` is set, render the game component full-screen (same lazy loading pattern as current).

---

## Step 8: Create `src/pages/teacher/CreateGame.jsx`

**Purpose:** Wizard-style game creation page.

**State:**
- `step` (1 | 2 | 3)
- `lessonText`
- `gameType`
- `generating`, `genProgress`, `genError`, `genSimulation`
- `showWizard`, `showTemplates`

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  Step indicators: [1] [2] [3]                   │
│  ════════════════════════════════               │
│                                                 │
│  Step 1: Coller la leçon / Uploader image       │
│    - Textarea for lesson text                   │
│    - ImageQuizGenerator component               │
│    - Next button                                │
│                                                 │
│  Step 2: Choisir le type de jeu                 │
│    - 6 game type cards (quiz, puzzle, etc.)     │
│    - Next + Back buttons                        │
│                                                 │
│  Step 3: Prévisualiser et Générer               │
│    - Generate button                            │
│    - Progress indicator                         │
│    - Simulation warning                         │
│    - Back button                                │
│                                                 │
│  Also: "Mode rapide" link → opens showCreator   │
│  Also: "Modèles" button → opens TemplatePicker  │
└─────────────────────────────────────────────────┘
```

**Modals:**
- QuizWizard (when showWizard)
- TemplatePicker (when showTemplates)
- GenerationModal (during generation)

**On generate:** Calls `generateGameFromText()`, adds game to store, shows success feedback.

---

## Step 9: Create `src/pages/teacher/Analytics.jsx`

**Purpose:** Tabbed analytics page.

**Internal tabs:**
1. **Vue d'ensemble** (default)
2. **Par Élève**
3. **IA & Recommandations**

**State:**
- `activeTab` ('overview' | 'students' | 'ai')
- `confirmReset`, `countdown`, `expandedStudent` (from current TeacherAnalytics)

**Tab 1 - Vue d'ensemble:**
- 3x MetricCard: Élèves, Tentatives, Score Moyen
- "Performances par Jeu" header with PDF export + reset buttons
- Reset confirmation (countdown + progress bar)
- Games performance bars list
- Concepts Mal Maîtrisés section
- Success message (if all concepts mastered)

**Tab 2 - Par Élève:**
- Expandable student cards (same accordion as current)
- Each card shows: student name, level, XP, game results with progress bars
- SessionComparison + SessionReport in 2-column grid

**Tab 3 - IA & Recommandations:**
- AIAnalytics component
- (Future: sub-tabs for Observations / Recommandations / Plan de révision)

---

## Step 10: Create `src/pages/teacher/Groups.jsx`

**Purpose:** Full group and student management page.

**Content:**
- GroupManager component (full version, already handles add/expand/assign)
- Below: Student list with XP, level, attempts per group
- "Non assignés" section with assign dropdown

**State:** Reads from `useGameStore` (groups, students).

---

## Step 11: Modify `src/App.jsx`

**Changes:**
1. Import `TeacherLayout` from `./layouts/TeacherLayout`
2. Import 5 new teacher page components
3. Remove old `TeacherDashboard` and `TeacherAnalytics` imports
4. Add nested route structure:

```jsx
<Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<TeacherDashboardPage />} />
  <Route path="games" element={<TeacherGamesPage />} />
  <Route path="create" element={<TeacherCreatePage />} />
  <Route path="analytics" element={<TeacherAnalyticsPage />} />
  <Route path="groups" element={<TeacherGroupsPage />} />
</Route>
```

**Note:** React Router v7 still supports this exact pattern. The `TeacherLayout` uses `<Outlet />` to render child routes.

**Redirect:** `/teacher` (index) → `/teacher/dashboard`

---

## Step 12: Update `src/components/Navbar.jsx`

**Minimal changes only:**
- When `role === 'teacher'`, the nav links should update to point to the new sidebar routes:
  - "Tableau de Bord" → `/teacher/dashboard`
  - "Analytiques" → `/teacher/analytics`
- OR: Hide the teacher nav links from the Navbar entirely since the sidebar handles navigation.
  - **Decision:** Hide teacher-specific nav links from Navbar when in teacher mode. The sidebar IS the navigation. Keep only: logo, theme toggle, settings gear, role toggle, notifications.
  - This means the `navLinks` array for teacher role becomes empty `[]`, so no nav buttons render in the header for teachers.

---

## Step 13: Delete old files

- Delete `src/dashboards/TeacherDashboard.jsx`
- Delete `src/dashboards/TeacherAnalytics.jsx`

---

## Implementation Order

1. `MetricCard.jsx` (utility component, no deps)
2. `TeacherSidebar.jsx` (standalone)
3. `TeacherLayout.jsx` (depends on Sidebar + Navbar)
4. `GameCard.jsx` + `GameRow.jsx` (utility components)
5. `pages/teacher/Dashboard.jsx` (simplest page)
6. `pages/teacher/Games.jsx` (largest, most complex)
7. `pages/teacher/CreateGame.jsx`
8. `pages/teacher/Analytics.jsx`
9. `pages/teacher/Groups.jsx`
10. Modify `App.jsx` (routes)
11. Modify `Navbar.jsx` (hide teacher nav links)
12. Delete old dashboard files
13. Run `npm run lint` + `npm run build` to verify

---

## CSS Additions to `index.css`

None needed beyond existing Tailwind utilities. All styling uses Tailwind classes inline. The sidebar width transitions use Tailwind's `transition-all duration-300`.

---

## Edge Cases & Considerations

1. **Game preview mode:** When `previewId` is set in Games.jsx, the component renders the game full-screen. This needs to overlay or replace the game list within the scrollable content area. The sidebar + navbar remain visible.

2. **SettingsModal:** Currently opened from Navbar's gear button. In the new layout, it's also opened from the sidebar's "Paramètres" item. Solution: The TeacherLayout owns the `settingsOpen` state and passes `onSettings` to the sidebar. The Navbar's gear button also calls this. OR: Use the existing `useSettingsStore` for the modal state.

3. **Dark mode:** All new components must include `dark:` variants for every color/style.

4. **Responsive:** The sidebar should auto-collapse on small screens or be hidden. On mobile (< sm), the sidebar should be hidden and accessible via hamburger. However, the spec doesn't mention mobile sidebar behavior explicitly, so we'll keep it simple: sidebar is always visible on desktop, hidden on mobile with a hamburger toggle.

5. **ProtectedRoute wrapper:** The `/teacher` parent route uses `ProtectedRoute` which checks role. All child routes are automatically protected.

6. **Student routes unchanged:** The existing `MainLayout` (Navbar + content) continues to wrap student routes (`/dashboard`, `/leaderboard`, `/profile`).

---

## Risk Assessment

- **Medium risk:** The Games.jsx page is the most complex (carries ~80% of current TeacherDashboard logic). Must carefully extract all game list, editing, filtering, and session logic.
- **Low risk:** Dashboard, Groups, CreateGame are straightforward extractions.
- **Low risk:** Analytics is mostly a reorganization of TeacherAnalytics into tabs.
- **Low risk:** Router changes are mechanical.
