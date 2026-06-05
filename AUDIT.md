# AUDIT.md — PPE Informatique (Réaudit)

Date: juin 2026. Vérifié après correction du cycle précédent.

## Résumé

| Statut | Nb | Items |
|--------|----|-------|
| 🔴 Critique restant | 1 | API key non révoquée |
| 🟠 Moyen restant | 1 | routes incohérentes |
| 🔵 Bas restant | 3 | Pas de tests, Navbar long, eslint config path |
| ✅ Corrigé | 11 | `.gitignore`, XP display, `failedConcepts`, Leaderboard, `lang="fr"`, constante XP, shuffle, unused state, falsy check, Puzzle matching, useTheme dead return |

---

## 1. Sécurité — CRITICAL

### 1.1 🔴 `.env` contient encore la clé API réelle

La clé API réelle (visible dans `.env`) est toujours présente localement. `.gitignore` bloque le commit de `.env`, mais la clé devrait être **révoquée** dans Google Cloud Console car elle a déjà été exposée.

**Remédiation :** Révoquer la clé sur https://console.cloud.google.com/apis/credentials

---

## 2. Bugs & Logique

### 2.1 ✅ XP progress display — CORRIGÉ

`StudentDashboard.jsx` et `Navbar.jsx` utilisent maintenant `XP_PER_LEVEL`. La sidebar affiche `totalXP % XP_PER_LEVEL / XP_PER_LEVEL` au lieu de `Math.ceil(totalXP / XP_PER_LEVEL) * XP_PER_LEVEL`.

### 2.2 ✅ `failedConcepts` — CORRIGÉ

`submitGameResult` accepte `failedConceptNames[]` optionnel. `QuizGame` collecte les concepts des questions mal répondues via `q.concept` et les passe à `submitGameResult`. Les données apparaissent dans la section "Concepts Mal Maîtrisés" du `TeacherDashboard`.

### 2.3 ✅ PuzzleGame matching logic — CORRIGÉ

Les éléments droits possèdent maintenant une propriété explicite `matchesWith` liée à l'ID gauche. La validation compare `selectedLeft === rightItem.matchesWith`, indépendant de l'ID de l'élément droit. Les paires asymétriques sont supportées.

### 2.4 ✅ `VITE_GEMINI_API_KEY` falsy check — CORRIGÉ

Remplacement par `isApiKeyMissing = import.meta.env.VITE_GEMINI_API_KEY === undefined || import.meta.env.VITE_GEMINI_API_KEY.trim() === ''`.

---

## 3. Architecture

### 3.1 ✅ `useTheme` — CORRIGÉ

`Navbar` consomme maintenant `{ theme, toggleTheme }` via `useTheme()` au lieu d'accéder directement à `useSettingsStore`. Le hook est l'unique point d'entrée pour la gestion du thème. Le retour n'est plus du code mort.

### 3.2 ✅ Leaderboard dupliqué — CORRIGÉ

`StudentDashboard` utilise maintenant `<Leaderboard />`, `StudentLeaderboard` est un wrapper autour de `<Leaderboard />`. Une seule implémentation.

### 3.3 🟠 Routes incohérentes

`/teacher/analytics` est une page séparée avec bouton retour, alors que l'analytique aurait pu être un onglet interne à `/teacher`. Pas bloquant.

### 3.4 🔵 Aucun test

Toujours aucun test framework installé.

---

## 4. UI / Style

### 4.1 ✅ `lang="fr"` — CORRIGÉ

`index.html` a maintenant `<html lang="fr">`.

### 4.2 ✅ Favicon — DISPONIBLE

`public/favicon.svg` existe. Link dans `index.html` fonctionne.

### 4.3 ✅ Magic number — CORRIGÉ

`300` remplacé par `XP_PER_LEVEL` partout via `src/constants.js`.

### 4.4 🟠 Voir 2.4

---

## 5. Qualité du code

### 5.1 ✅ Puzzle shuffle — CORRIGÉ

Fisher-Yates remplace `Array.sort(() => Math.random() - 0.5)`.

### 5.2 ✅ Extensions — CONFORME

`.jsx` pour composants, `.js` pour stores/utils.

### 5.3 🔵 Navbar long

170 lignes — gère navigation, roles, thème, sélecteur étudiant, menu mobile, settings. Pourrait être découpé.

### 5.4 ✅ PuzzleGame unused state — CORRIGÉ

`useState` remplacé par `useMemo`.

---

## 6. Configuration

### 6.1 ✅ `.gitignore` — CORRIGÉ

`.gitignore` créé avec `node_modules/`, `dist/`, `.env`.

### 6.2 🔵 Eslint config path

`eslint.config.js` importe depuis `eslint/config` — fonctionne avec eslint v10 actuel.

---

## 7. Priorités restantes

1. **Révoquer la clé API** dans Google Cloud Console
