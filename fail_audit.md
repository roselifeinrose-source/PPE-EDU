# Rapport d'Audit — PPE Informatique

> Date : 18/06/2026
> Projet : PPE-EDU — Application pédagogique React/Express

---

## Sécurité & Authentification

### 🔴 Critique

- [ ] **Mot de passe étudiant contourné** — `server/routes/auth.js:39-59` : la connexion élève ne vérifie aucun mot de passe, juste un `studentId` ou un `name`. N'importe qui peut se connecter en tant que n'importe quel élève en connaissant son nom.
- [ ] **Mots de passe stockés en clair** — `server/db/teacher.json:7`, `server/db/student.json:6` : `admin123` et `student123` sans aucun hash (bcrypt absent du projet).
- [ ] **Clé API Gemini exposée** — `.env` : `AIzaSyCo-IV95L6_ho8LOAuV-VP0E1hhIEW3tG8` compilée dans le bundle frontend (variable `VITE_GEMINI_API_KEY`), extractible via DevTools.
- [ ] **Secret JWT codé en dur** — `server/middleware/auth.js:3` : fallback `'ppe-edu-secret-key-2025'` si `JWT_SECRET` non défini (aucun `.env` serveur).
- [ ] **Injection de champs arbitraires (PUT/POST)** — `server/routes/games.js:25,38` et `server/routes/students.js:58-60` : utilisation de `...req.body` sans whitelist. Un élève peut modifier `totalXP`, `level`, `scores`, etc. via l'API.
- [ ] **Aucune validation d'entrée** — Aucune route ne valide types, longueurs, formats (email, score 0-100, etc.). `score` peut être négatif, `name` peut être une chaîne vide.

### 🟠 Élevé

- [ ] **Routes GET /api/students sans vérification de rôle** — `server/routes/students.js:13,19` : un étudiant peut lister et lire le profil de tous les autres étudiants.
- [ ] **Route PUT /api/students/:id sans vérification de rôle** — `server/routes/students.js:54` : un étudiant peut modifier les données de n'importe quel autre étudiant.
- [ ] **Pas de limite de taux (rate limiting)** — `POST /api/auth/login` vulnérable au brute-force.
- [ ] **CORS grand ouvert** — `server/index.js:12` : `app.use(cors())` sans restriction d'origine.
- [ ] **Route `/chat` non protégée** — `src/App.jsx:72-74` : accessible sans authentification (expose l'IA et la clé API).
- [ ] **Aucune en-tête de sécurité** — `helmet` absent : pas de CSP, X-Frame-Options, X-Content-Type-Options.

### 🟡 Moyen

- [ ] **Messages d'erreur verbeux** — `server/routes/auth.js:16` : "Cet email est déjà utilisé" permet l'énumération d'emails.
- [ ] **Données sensibles dans localStorage** — JWT (`ppe-token`), user complet (`ppe-user`), état complet (`ppe-game-store`) stockés en clair.
- [ ] **`useAuthStore.init()` sans try/catch** — `src/store/useAuthStore.js:14-16` : `JSON.parse(user)` plante si localStorage corrompu.
- [ ] **Logs contenant des PII** — `server/logger.js` : emails et noms d'étudiants enregistrés sans filtrage.
- [ ] **Aucune expiration ou révocation de JWT** — 7 jours sans mécanisme de refresh.

### 🔵 Bas

- [ ] **Mot de passe par défaut identique pour tous les étudiants** — `student123` dans `server/routes/students.js:34`.
- [ ] **Groupe `cors` dans les dépendances client** (devrait être côté serveur uniquement).
- [ ] **Nom de modèle Gemini invalide** — `gemini-3.5-flash` n'existe pas (dernier : `gemini-2.0-flash`).

---

## Gestion des Erreurs & Fallbacks

### 🔴 Critique

- [x] **`submitGameResult` en fire-and-forget** — `src/store/useGameStore.js:256` : l'appel API n'est pas attendu. En cas d'échec, les scores sont perdus côté serveur.
- [x] **Aucune gestion d'erreur fichier serveur** — `server/db.js:11,16` : `readJSON`/`writeJSON` sans try/catch. Un fichier JSON corrompu plante le serveur.
- [x] **Aucun try/catch dans les routes serveur** — `server/routes/*.js` : zéro bloc try/catch dans les 4 fichiers de routes.

### 🟠 Élevé

- [x] **Toutes les actions CRUD du store acceptent silencieusement l'échec API** — 17 actions (addStudent, removeGame, etc.) tombent en mode local sans notifier l'utilisateur.
- [x] **`syncFromAPI` peut être appelée deux fois au démarrage** — `src/store/useGameStore.js:546` + `src/App.jsx:40` : race condition, les données du premier appel peuvent être écrasées.
- [x] **`catch {}` nus dans ChatBot/TeacherChatBot** — Les erreurs API sont complètement avalées sans log.
- [x] **`ActivityFeed.jsx` génère des données factices** — Quand le flux est vide, 3 activités inventées sont affichées sans indication visuelle.
- [x] **Service worker échoue silencieusement** — `src/main.jsx:14` : `.catch(() => {})` sans aucun log.

### 🟡 Moyen

- [ ] **Aucun timeout sur fetch** — `src/api/apiService.js:22` : si le serveur ne répond pas, la requête peut pendre indéfiniment.
- [ ] **`syncFromAPI` écrase les modifications locales** — Les jeux créés hors-ligne sont perdus lors de la prochaine synchro.
- [ ] **Réhydratation silencieuse** — `useGameStore.js:532-548` : si localStorage est corrompu, les données sont perdues sans notification.
- [ ] **`rateLimit` silencieux** — `useGameStore.js:259` : quand un élève dépasse 10 parties/heure, rien n'est affiché.

### 🔵 Bas

- [ ] **Bare `catch {}` dans `ActivityFeed.jsx:71`** — Retourne `''` sans log.
- [ ] **Erreur `simulationReason` non affichée** — Les raisons d'échec API ne sont pas montrées à l'utilisateur.
- [ ] **Absence de mécanisme de resync périodique** — L'état devient obsolète si d'autres onglets modifient les données.

---

## Cohérence des Données & State Management

### 🟠 Élevé

- [ ] **Mises à jour optimistes sans rollback** — Toutes les actions du store modifient l'état local avant/indépendamment de la réponse API. Aucun mécanisme de réconciliation.
- [ ] **`submitGameResult` avec effet de bord dans `set()`** — `useGameStore.js:254-293` : appel réseau lancé depuis le callback `set()` (qui doit être pur).
- [ ] **Pas de flag `hydrated` dans useGameStore** — Impossible d'afficher un état de chargement lors de l'hydratation.
- [ ] **`TeacherNotifications` stale closure** — Le `prev` capturé peut manquer des changements entre les ticks d'intervalle.

### 🔵 Bas

- [ ] **`useTheme.js` logique morte** — Le thème `'auto'` n'est jamais défini mais vérifié.
- [ ] **`FloatingAvatar` timers non nettoyés** — Plusieurs `setTimeout` dans les event handlers ne sont pas nettoyés au démontage.
- [ ] **Données de test avec champ `level` inutilisé** — `useGameStore.test.js:8` : `level: 1` n'est jamais lu (trompeur).
- [ ] **Composants abonnés à des tableaux entiers** — `students` et `games` entiers souscrits dans Navbar, Dashboard, etc. → re-rendus inutiles.

---

## Validation Côté Serveur

### 🟠 Élevé

- [ ] **Aucune validation de type/longueur** — Aucune route ne valide les types (number, string), longueurs max, ou formats (email, gametype).
- [ ] **`score` et `xpGained` non validés** — `server/routes/games.js:53-54` : valeurs négatives acceptées, nombre de parties non limité.
- [ ] **`name` des étudiants accepte chaîne vide** — `server/routes/students.js:28` : `if (!name)` ne détecte pas `""`.
- [ ] **`groupId` accepté sans vérification** — `server/routes/students.js:32` : un groupe inexistant peut être assigné.

### 🟡 Moyen

- [ ] **Risque de traversée de chemin dans `db.js`** — `path.join(DB_DIR, filename)` sans validation, même si actuellement appelé avec des chaînes fixes.
- [ ] **Risque de pollution de prototype** — Spread de `req.body` avec clés `__proto__`.
- [ ] **Aucune validation d'email** — Format email non vérifié à l'inscription.
- [ ] **Fichiers JSON en lecture/écriture sans verrouillage** — Race condition possible entre deux requêtes concurrentes.

---

## Améliorations Recommandées

### Priorité Haute

- [ ] Ajouter `bcrypt` et hasher tous les mots de passe (signup + stockage + login teacher)
- [ ] Rétablir la vérification du mot de passe étudiant (ou supprimer l'authentification étudiante)
- [ ] Remplacer `VITE_GEMINI_API_KEY` par un proxy serveur (la clé ne doit pas être dans le bundle client)
- [ ] Ajouter un secret JWT via `.env` serveur uniquement (retirer le fallback hardcodé)
- [ ] Remplacer tous les `...req.body` par une extraction explicite des champs autorisés
- [ ] Ajouter des try/catch autour de `readJSON`/`writeJSON` dans `server/db.js`
- [ ] Ajouter `express-rate-limit` sur les routes d'authentification
- [ ] Restreindre CORS à l'origine du frontend

### Priorité Moyenne

- [ ] Ajouter `helmet` pour les en-têtes de sécurité
- [ ] Ajouter un timeout aux requêtes fetch (ex: `AbortController` avec 10s)
- [ ] Ajouter un flag `hydrated` dans `useGameStore` pour l'état de chargement
- [ ] Notifier l'utilisateur quand l'API est inaccessible (toast/bannière)
- [ ] Dédupliquer `syncFromAPI` au démarrage (éviter la race condition)
- [ ] Valider le type/format des entrées sur toutes les routes (express-validator ou manuel)
- [ ] Attendre `submitGameResult` avec retry et notification utilisateur
- [ ] Ajouter un mécanisme de resync périodique ou indicateur de "dernière synchro"
- [ ] Protéger la route `/chat` avec `ProtectedRoute`

### Priorité Basse

- [ ] Ajouter un indicateur visuel sur les données de simulation (feed activity, erreur API)
- [ ] Uniformiser les messages d'erreur (ne pas distinguer "non trouvé" vs "mot de passe incorrect")
- [ ] Filtrer les PII des logs serveur
- [ ] Nettoyer les timers non gérés dans `FloatingAvatar`
- [ ] Retirer les `catch {}` nus — au minimum un `console.error`
- [ ] Ajouter la rotazione des clés API et la révocation des tokens
- [ ] Ajouter HTTPS en production
- [ ] Vérifier et corriger `gemini-3.5-flash` → `gemini-2.0-flash`
