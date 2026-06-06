# AUDIT.md — PPE Informatique (Réaudit)

Date: juin 2026. Vérifié après correction du cycle complet (60 items IMPROVEMENT.md).

## Résumé

| Statut | Nb | Items |
|--------|----|-------|
| 🔴 Critique restant | 1 | API key non révoquée (action externe) |
| 🟠 Moyen restant | 1 | Routes incohérentes (design choice) |
| 🔵 Bas restant | 2 | Navbar long, eslint config path |
| ✅ Corrigé本轮 | 39 | Voir ci-dessous |
| ✅ Corrigé précédent | 11 | `.gitignore`, XP display, `failedConcepts`, Leaderboard, `lang="fr"`, constante XP, shuffle, unused state, falsy check, Puzzle matching, useTheme dead return |

---

## 1. Sécurité — CRITICAL

### 1.1 🔴 `.env` contient encore la clé API réelle

La clé API réelle (visible dans `.env`) est toujours présente localement. `.gitignore` bloque le commit de `.env`, mais la clé devrait être **révoquée** dans Google Cloud Console car elle a déjà été exposée.

**Remédiation :** Révoquer la clé sur https://console.cloud.google.com/apis/credentials

### 1.2 ✅ Fuite de clé API dans la console — CORRIGÉ

`ChatBot.jsx:19` et `aiService.js:136` contenaient `console.log({ apiKey })` / `console.warn({ apiKey })`. Ces lignes supprimées.

---

## 2. Bugs & Logique

### 2.1 ✅ XP progress display — CORRIGÉ

`StudentDashboard.jsx` et `Navbar.jsx` utilisent `XP_PER_LEVEL`.

### 2.2 ✅ `failedConcepts` — CORRIGÉ

`submitGameResult` accepte `failedConceptNames[]` optionnel.

### 2.3 ✅ PuzzleGame matching logic — CORRIGÉ

`matchesWith` explicite pour validation indépendante de l'ID.

### 2.4 ✅ `VITE_GEMINI_API_KEY` falsy check — CORRIGÉ

Vérification `=== undefined || .trim() === ''`.

### 2.5 ✅ Quiz soumet sans élève connecté — CORRIGÉ

`QuizGame.jsx` vérifie `currentStudentId` avant d'appeler `submitGameResult`.

### 2.6 ✅ localStorage corrompu — CORRIGÉ

`onRehydrateStorage` dans `useGameStore.js` reset aux defaults si JSON invalide.

### 2.7 ✅ Reset analytics détruit les XP — CORRIGÉ

`resetAnalytics()` ne touche que les analytics jeux. `resetAll()` séparé pour tout réinitialiser.

### 2.8 ✅ Concepts échoués non filtrés — CORRIGÉ

Les concepts échoués ne s'affichent que pour les jeux avec `attempts > 0`.

### 2.9 ✅ Simulation IA silencieuse — CORRIGÉ

Badge "Mode simulation" + bannière amber quand l'API Gemini est indisponible.

### 2.10 ✅ Parsing ChatBot `response.text` — CORRIGÉ

Gestion des deux formes possibles (string / function) de `@google/genai` v2.x.

### 2.11 ✅ Double client API inutile — CORRIGÉ

Instance `GoogleGenAI` singleton au niveau module dans `aiService.js` et `ChatBot.jsx`.

---

## 3. Architecture

### 3.1 ✅ `useTheme` — CORRIGÉ

Hook utilisé correctement via `Navbar`.

### 3.2 ✅ Leaderboard dupliqué — CORRIGÉ

`<Leaderboard />` composant unique réutilisé.

### 3.3 🟠 Routes incohérentes

`/teacher/analytics` est une page séparée. Pas bloquant.

### 3.4 ✅ Aucun test — CORRIGÉ

Vitest configuré avec 11 tests unitaires sur `useGameStore`.

### 3.5 ✅ Routes sans protection — CORRIGÉ

`ProtectedRoute.jsx` bloque les élèves sur `/teacher*` et les enseignants sur `/dashboard*`.

### 3.6 ✅ Aucun ErrorBoundary — CORRIGÉ

`ErrorBoundary.jsx` wrappé autour des routes dans `App.jsx`.

### 3.7 ✅ Lazy loading absent — CORRIGÉ

`React.lazy()` + `Suspense` sur QuizGame, PuzzleGame, SequencingGame. Chaque jeu est un chunk séparé.

### 3.8 ✅ Client API créé à chaque requête — CORRIGÉ

Instance singleton au niveau module.

---

## 4. UI / Style

### 4.1 ✅ `lang="fr"` — CORRIGÉ

`<html lang="fr">` dans `index.html`.

### 4.2 ✅ Favicon — DISPONIBLE

`public/favicon.svg` existe.

### 4.3 ✅ Magic number — CORRIGÉ

`XP_PER_LEVEL` depuis `src/constants.js`.

### 4.4 ✅ Sélecteur de type de jeu sans feedback — CORRIGÉ

3 cartes cliquables (icône + label + description) remplacent le `<select>`.

### 4.5 ✅ Barres de concept minuscules — CORRIGÉ

Augmentées de `h-1.5` à `h-2.5`.

### 4.6 ✅ Scrollbar WebKit uniquement — CORRIGÉ

`scrollbar-width` et `scrollbar-color` ajoutés pour Firefox.

### 4.7 ✅ Aucun breadcrumb — CORRIGÉ

Fil d'Ariane ajouté dans le Navbar.

### 4.8 ✅ Pas de meta tags — CORRIGÉ

Meta description, Open Graph, Twitter cards, theme-color ajoutés.

### 4.9 ✅ Menu mobile sans animation — CORRIGÉ

Transition slide-down ajoutée.

### 4.10 ✅ Pas de print styles — CORRIGÉ

`@media print` rules dans `index.css`.

---

## 5. Qualité du code

### 5.1 ✅ Puzzle shuffle — CORRIGÉ

Fisher-Yates implémenté.

### 5.2 ✅ Extensions — CONFORME

`.jsx` composants, `.js` stores/utils.

### 5.3 🔵 Navbar long

~210 lignes — gère navigation, roles, thème, sélecteur étudiant, menu mobile, settings, breadcrumb. Pourrait être découpé en composants plus petits.

### 5.4 ✅ PuzzleGame unused state — CORRIGÉ

`useState` remplacé par `useMemo`.

### 5.5 ✅ aria-label manquants — CORRIGÉ

`aria-label` ajoutés sur les boutons icônes dans Navbar.

### 5.6 ✅ Escape key modals — CORRIGÉ

Tous les modals (Settings, Generation, Delete) gèrent `Escape`.

---

## 6. Configuration

### 6.1 ✅ `.gitignore` — CORRIGÉ

`node_modules/`, `dist/`, `.env`.

### 6.2 🔵 Eslint config path

`eslint.config.js` importe depuis `eslint/config` — fonctionne avec eslint v10.

---

## 7. Fonctionnalités ajoutées本轮

| # | Fonctionnalité | Fichier(s) |
|---|----------------|------------|
| 1 | Fiche de progression par jeu (rejouer, barre par concept) | StudentDashboard |
| 2 | Système de badges (5 types, localStorage) | Badges.jsx, useBadges.js |
| 3 | Mode défi (timer 30s, multiplicateur XP) | ChallengeMode.jsx |
| 4 | Statistiques personnelles élève | StudentStats.jsx |
| 5 | Streak quotidien (7 jours) | useStreak.js |
| 6 | Animation de confettis (CSS) | confetti.css |
| 7 | Partage de score (image PNG) | ShareButton.jsx, html2canvas |
| 8 | Profil élève personnalisable (avatar) | ProfileModal.jsx |
| 9 | Suggestions de questions ChatBot | ChatBot.jsx |
| 10 | Historique ChatBot persistant | useChatStore.js |
| 11 | Timestamps sur messages ChatBot | ChatBot.jsx |
| 12 | Notification de level-up | LevelUpToast.jsx |
| 13 | Gestion élèves dans Settings | SettingsModal.jsx |
| 14 | Édition contenu inline (quiz/puzzle/step) | TeacherDashboard |
| 15 | Sélection bulk + suppression + export JSON | TeacherDashboard |
| 16 | Détail par élève dans Analytics | TeacherAnalytics |
| 17 | Recherche + filtre jeux | TeacherDashboard |
| 18 | Timestamp de création sur jeux | TeacherDashboard |
| 19 | Mode simulation visible (badge + bannière) | TeacherDashboard |
| 20 | Skeleton/spinner initial + fallback localStorage | useGameStore |
| 21 | ErrorBoundary | App.jsx |
| 22 | Lazy loading jeux | TeacherDashboard, StudentDashboard |
| 23 | Breadcrumb | Navbar.jsx |
| 24 | PWA manifest | manifest.json |
| 25 | Meta tags SEO | index.html |
| 26 | Print styles | index.css |
| 27 | Firefox scrollbar | index.css |
| 28 | Escape key modals | SettingsModal, GenerationModal, DeleteConfirmModal |
| 29 | Vitest + 11 tests | useGameStore.test.js |
| 30 | Level-up toast notification | LevelUpToast.jsx (IDEA 18) |
| 31 | Difficulty stars 1-3 | All game cards — teacher + student |
| 32 | Best score tracking | `bestScores` in store; displayed on student cards (IDEA 36) |
| 33 | Export PDF analytics | TeacherAnalytics button → `window.print()` (IDEA 5) |
| 34 | Auto dark mode | `useTheme.js` detects `prefers-color-scheme` (IDEA 43) |
| 35 | Comment on games | Student cards show teacher comment (IDEA 27) |
| 36 | Real-time session dashboard | SessionDashboard.jsx — live scores, timer, simulate (IDEA 3) |
| 37 | Class groups | GroupManager.jsx — CRUD groups, assign students (IDEA 4) |
| 38 | Teacher notifications | TeacherNotifications.jsx — level-up + game completion alerts (IDEA 9) |
| 39 | Presentation/projector mode | PresentationMode.jsx — fullscreen, top 5 live (IDEA 10) |
| 40 | Global class stats | GlobalClassStats.jsx — completion rate, avg score, hardest concepts (IDEA 25) |
| 41 | Session comparison | SessionComparison.jsx — compare two date periods (IDEA 8) |
| 42 | Session report | SessionReport.jsx — downloadable TXT report (IDEA 30) |
| 43 | Publication calendar | PublicationCalendar.jsx — schedule game visibility (IDEA 24) |
| 44 | Image quiz generation | ImageQuizGenerator.jsx — Gemini Vision from photo (IDEA 21) |
| 45 | Fog mode | FogMode.jsx + StudentDashboard leaderboard hidden (IDEA 48) |
| 46 | Activity logs | ActivityLogs.jsx — 200 logs, timestamps, icons (IDEA 47) |
| 47 | Multi-language (i18n) | translations.js (FR/AR/EN) + useTranslation hook (IDEA 41) |
| 48 | Custom accent color | 6 colors in SettingsModal + useSettingsStore (IDEA 42) |
| 49 | Accessibility (ARIA) | role="dialog", aria-label, aria-modal on all modals/buttons (IDEA 44) |

---

## 8. Priorités restantes

1. **Révoquer la clé API** dans Google Cloud Console (action externe)
2. Découper la Navbar en sous-composants
3. Corriger le path eslint config si nécessaire
