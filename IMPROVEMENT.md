# IMPROVEMENT.md — Plan d'Amélioration InforGames

Ce fichier rassemble l'ensemble des axes d'amélioration identifiés lors de l'audit fichier par fichier.

---

## 🔴 Priorité : Haute (High) — 20 points

### Espace Enseignant (Teacher Experience)

- [x] 1. **Fuite de clé API dans la console** : `ChatBot.jsx:19` contient `console.log({ apiKey })` qui expose la clé Gemini en production. La même chose existe dans `aiService.js:136` avec `console.warn({ apiKey })`. Ces lignes doivent être supprimées ou conditionnées par `import.meta.env.DEV` pour éviter la publication accidentelle de secrets.

- [x] 2. **Silence trompeur lors de la simulation IA** : Dans `aiService.js:158-161`, quand l'API Gemini échoue, le catch retourne `mockGame()` sans aucun indicateur visuel pour l'enseignant. Le professeur croit avoir un vrai quiz généré par IA alors qu'il reçoit des données fictives. Il faut afficher un avertissement clair dans le `GenerationModal` ou un badge "Mode simulation" sur le jeu créé.

- [x] 3. **Aucune validation du contenu généré par IA** : `parseGameResponse()` (`aiService.js:70-81`) fait un `JSON.parse()` sans try/catch ni validation de schema. Si Gemini retourne un JSON mal formé ou incomplet (questions vides, `correctIndex` hors limites), l'application crash silencieusement ou affiche un jeu corrompu. Il faut valider la structure minimale avant de sauvegarder.

- [x] 4. **Pas de protection des routes par rôle** : `App.jsx` rend toutes les routes (`/teacher`, `/teacher/analytics`, `/dashboard`, `/leaderboard`) sans aucune vérification d'authentification. Un élève peut accéder à `/teacher` en tapant l'URL directement. Il faut ajouter un composant `ProtectedRoute` qui vérifie `useAuthStore.role`.

- [x] 5. **Le bouton "Réinitialiser" n'a pas d'annulation** : Dans `TeacherAnalytics.jsx:95`, le `resetAnalytics()` remet TOUTES les données (XP, niveaux, parties, analytics) à zéro sans possibilité de retour. La confirmation est basique. Pour une soutenance, il faudrait au minimum un export JSON des données avant reset, ou un timer de 5 secondes avant exécution.

- [x] 6. **Pas de gestion des erreurs de parsing dans le ChatBot** : `ChatBot.jsx:43` utilise `response.text` sans vérifier si c'est un objet ou une string. L'API `@google/genai` v2.x peut retourner un objet avec une propriété `text` differently structurée selon la version. Aucun fallback n'est prévu.

- [x] 7. **Double appel API inutile dans le ChatBot** : `ChatBot.jsx` crée un `new GoogleGenAI({ apiKey })` à chaque envoi de message (ligne 38). L'instance devrait être créée une seule fois au niveau du module ou du composant pour éviter de réinitialiser le client à chaque requête.

- [x] 8. **Aucun indicateur de date/timestamp sur les jeux créés** : Lorsque l'enseignant crée plusieurs jeux, il est impossible de savoir lequel a été créé en premier. Le champ `id: 'g' + Date.now()` contient la date mais elle n'est pas affichée nulle part dans l'UI. Il faut ajouter un `createdAt` visible sur les cartes.

- [x] 9. **Le sélecteur de type de jeu manque de feedback visuel** : Dans `TeacherDashboard.jsx:140-149`, le `<select>` est un élément natif sans style distinctif. Il n'y a aucune description ou icône pour chaque type de jeu. Un enseignant ne sait pas forcément ce que "Séquencement" signifie concrètement.

- [x] 10. **Pas de pagination ni de recherche pour les jeux** : Si un enseignant crée 20+ jeux, la liste `TeacherDashboard.jsx:188-273` les affiche tous en vertical sans filtre, tri, ni pagination. La performance et l'ergonomie se dégradent rapidement.

### Espace Élève (Student Experience)

- [ ] 11. **Le quiz soumet le score même sans élève connecté** : `QuizGame.jsx:41` appelle `submitGameResult()` avec `currentStudentId` qui peut être `null` si aucun élève n'est sélectionné. La fonction dans le store traite ce cas silencieusement (filtre par `s.id !== studentId` et ne fait rien), mais l'XP affiché dans le jeu (+50 XP) est mensonger car il n'est pas attribué.

- [ ] 12. **Pas de feedback sur les mauvaises réponses au Quiz** : `QuizGame.jsx:25-32` montre simplement une croix rouge et passe à la question suivante. Aucune explication n'est donnée sur pourquoi la réponse est fausse. Pour un contexte pédagogique, chaque mauvaise réponse devrait afficher une courte explication du concept.

- [ ] 13. **Le Puzzle ne donne jamais de score partiel** : `PuzzleGame.jsx:36` attribue toujours `finalScore = 100` et `xp = 50` quel que soit le nombre de tentatives. Un élève qui met 20 essais reçoit le même score que celui qui réussit du premier coup. Il faudrait compter les tentatives et ajuster le score.

- [ ] 14. **Aucune indication visuelle d'erreur dans le Puzzle** : `PuzzleGame.jsx:28-30` quand l'élève clique sur une mauvaise définition, `selectedLeft` est simplement réinitialisé sans aucun feedback. L'élève ne sait pas pourquoi ça n'a pas marché. Il faut un flash rouge ou un message temporaire.

- [ ] 15. **Pas de compteur de progression dans le Puzzle** : Contrairement au Quiz qui affiche "Question X / Y", le PuzzleGame n'indique pas "X paires sur Y trouvées". L'élève ne voit pas sa progression, ce qui réduit la motivation.

- [ ] 16. **Le Séquencement ne montre pas l'ordre correct après soumission** : `SequencingGame.jsx:36-38` affiche juste le score sans montrer quelles étapes étaient mal placées. L'élève ne peut pas apprendre de ses erreurs. Il faut afficher l'ordre correct à côté de l'ordre soumis.

- [ ] 17. **Les emojis de résultat sont en dur et non adaptatifs** : Les trois jeux utilisent `🎉` ou `💪` comme indicateur de résultat. Cela ne fonctionne pas sur tous les appareils/OS et n'est pas accessible (pas de texte alternatif). Il faut des composants visuels SVG ou des icônes Lucide à la place.

- [ ] 18. **L'XP est toujours de +50 quelle que soit la performance** : `QuizGame.jsx:40` calcule `xp = Math.round((finalScore / 100) * 50)`, donc un score de 20% donne 10 XP et 100% donne 50 XP. Mais Puzzle et Sequencing donnent toujours 50 XP fixe. L'XP devrait être cohérent et proportionnel partout.

- [ ] 19. **Le Séquencement utilise des boutons flèches trop petits** : `SequencingGame.jsx:54-55` les boutons `ArrowUp`/`ArrowDown` ont juste `p-1` comme padding, ce qui est difficile à viser sur mobile. Pour des collégiens sur tablette, il faut au minimum `p-2` et des zones de toucher plus grandes.

- [ ] 20. **Pas d'animation de transition entre les questions du Quiz** : `QuizGame.jsx` change instantanément de question sans transition visuelle. Un `animate-in` ou `slide` donnerait un sentiment de progression et rendrait l'expérience plus fluide etengageante pour les adolescents.

---

## 🟡 Priorité : Moyenne (Medium) — 20 points

### Espace Enseignant (Teacher Experience)

- [x] 21. **Le modal Settings n'a qu'une seule option** : `SettingsModal.jsx` ne contient que le choix de thème. Pour une démo de soutenance, il manque des options comme la langue, la gestion des élèves (ajout/suppression), ou les préférences d'affichage. Le modal semble inachevé. → Ajouté onglet "Élèves" avec ajout/suppression + onglet "Thème".

- [x] 22. **Pas de chargement initial (skeleton/spinner)** : Quand l'application charge pour la première fois, il n'y a aucun indicateur de chargement. Le store Zustand persist lit le localStorage de manière synchrone, mais si le JSON est corrompu, il n'y a aucun fallback ni message d'erreur. → Ajouté `onRehydrateStorage` avec fallback vers données par défaut si JSON corrompu ou forme invalide.

- [x] 23. **Pas de tri ou filtrage des jeux** : `TeacherDashboard.jsx` affiche les jeux dans l'ordre d'ajout. Il n'y a aucun filtre par type (quiz/puzzle/sequencing), par date, ou par score moyen. Un enseignant avec 15 jeux ne peut pas retrouver rapidement un quiz spécifique. → Recherche + filtre par type ajoutés.

- [x] 24. **L'inline édition ne permet pas de modifier le contenu** : `TeacherDashboard.jsx:196-217` permet de modifier le titre et le sujet d'un jeu, mais pas les questions, les paires ou les étapes. Si l'IA génère une erreur dans une question, l'enseignant doit supprimer et recréer le jeu entièrement. → Édition inline complète avec champs par type (quiz/puzzle/sequencing).

- [x] 25. **Pas de bulk actions sur les jeux** : Il est impossible de sélectionner plusieurs jeux pour les supprimer, les déplacer ou les exporter. Chaque action est individuelle, ce qui est lent avec beaucoup de contenu. → Checkboxes de sélection, suppression en masse, export JSON.

- [x] 26. **Analytics ne montre pas la décomposition par élève** : `TeacherAnalytics.jsx` agrège les scores de tous les élèves ensemble. L'enseignant ne peut pas voir qu'Amina a 90% en Mémoire tandis que Youssef a 30%. C'est essentiel pour le suivi pédagogique. → Section "Détails par Élève" avec expansion, scores par partie, XP.

- [x] 27. **Le reset analytics remet aussi les XP et niveaux des élèves** : `useGameStore.js:89-95` le `resetAnalytics()` remet `totalXP: 0, level: 1` pour TOUS les élèves. C'est beaucoup trop destructeur pour un simple "reset des stats". Il faudrait séparer le reset des analytics des reset des progression élèves. → `resetAnalytics()` ne touche que les analytics jeux. `resetAll()` séparé pour tout réinitialiser.

- [x] 28. **Les barres de progression des concepts sont minuscules** : `TeacherAnalytics.jsx:134` les barres ont `h-1.5` ce qui est très difficile à lire. Même avec le code couleur (rouge/ambre/vert), la taille rend la donnée presque illisible à distance. → Augmenté à `h-2.5`.

- [x] 29. **Pas de considération pour le mode impression** : Les analytics sont conçus uniquement pour l'écran. Un enseignant qui veut imprimer le rapport pour une réunion n'obtiendra que des données brutes sans mise en page adaptée. Il faut des `@media print` rules. → Ajouté dans `index.css`.

- [x] 30. **Le compteur de concepts échoués peut être trompeur** : `TeacherDashboard.jsx:32-34` affiche les concepts échoués de TOUS les jeux, pas uniquement ceux des parties réellement jouées. Si un jeu n'a jamais été joué mais contient des `failedConcepts` (importés avec le jeu IA), ils apparaîtront quand même. → Filtré avec `g.analytics.attempts > 0`.

### Espace Élève (Student Experience)

- [ ] 31. **Pas de tutoriel ni d'onboarding** : Quand un élève accède pour la première fois à l'application, aucun guide ne lui explique comment jouer, ce que signifie l'XP, ou comment fonctionne le level-up. Il faut au minimum un tooltip ou une modale de bienvenue.

- [ ] 32. **Pas d'indicateur de jeux déjà complétés sur les cartes** : `StudentDashboard.jsx:79` affiche un petit texte "Complété · 75%" mais il n'y a aucune différence visuelle claire (fond vert, icône check, etc.) entre un jeu déjà fait et un nouveau jeu. L'élève ne peut pas identifier quickly les défis restants.

- [ ] 33. **Le classement ne montre pas d'évolution** : `Leaderboard.jsx` affiche un classement statique. Il n'y a pas d'indicateur de mouvement (↑↓) par rapport à la session précédente. C'est moins motivant qu'un classement dynamique avec des changements de position visibles.

- [ ] 34. **Pas de mécanique de série (streak) quotidienne** : Il n'y a aucun incitatif à revenir chaque jour. Les applications éducatives modernes (Duolingo, Kahoot) utilisent des séries quotidiennes pour maintenir l'engagement. Un simple compteur "X jours consécutifs" ajouterait de la rétention.

- [ ] 35. **Pas de notification de level-up** : Quand un élève atteint un nouveau niveau, rien ne se passe visuellement. Le chiffre change silencieusement. Il faudrait un popup de félicitations, un effet de confettis, ou au minimum un toast notification.

- [ ] 36. **Les cartes de jeux ne montrent pas la difficulté** : Aucun indicateur de difficulté (facile/moyen/difficile) n'est affiché sur les défis. L'élève ne peut pas adapter son effort en fonction de la complexité attendue.

- [ ] 37. **Pas de "jouer encore" ou de tentative multiple** : Une fois qu'un élève a complété un jeu, il ne peut pas le refaire pour améliorer son score. Le bouton affiche "Complété" mais ne permet pas de rejouer. C'est frustrant quand on veut progresser.

- [ ] 38. **Le ChatBot n'a pas d'historique persistant** : `ChatBot.jsx` perd tous les messages quand l'élève navigue vers une autre page. L'historique de conversation devrait être sauvegardé dans le store ou le localStorage pour permettre de reprendre la conversation.

- [ ] 39. **Pas de feedback sonore ni visuel sur les réponses** : Les jeux sont purement visuels. Pour des adolescents, des micro-interactions (son de succès, vibration sur mobile, animation de particules) rendraient l'expérience beaucoup plus engaging et mémorable.

- [ ] 40. **Le Séquencement ne fournit aucun indice** : Quand l'élève soumet un ordre incorrect, il obtient juste un score. Aucun indice n'est donné sur les étapes qui sont mal placées. Un surlignage des erreurs avec un lien vers le concept aiderait l'apprentissage.

---

## 🔵 Priorité : Basse (Low) — 20 points

### Espace Enseignant (Teacher Experience)

- [x] 41. **Pas de favicon personnalisé** : `index.html:5` référence `/favicon.svg` mais le fichier n'existe probablement pas dans `public/`. Un favicon manquant donne une impression d'inachevé. Il faut créer un favicon SVG avec le logo InforGames. → Favicon SVG déjà présent dans `public/`.

- [x] 42. **Meta tags incomplets pour le SEO et le partage** : `index.html` n'a pas de `<meta name="description">`, pas de Open Graph tags (`og:title`, `og:description`, `og:image`), ni de Twitter cards. Quand on partage le lien, l'aperçu sera vide ou générique. → Meta description, OG tags, Twitter cards et theme-color ajoutés.

- [x] 43. **Pas de gestion des Escape key pour les modals** : Tous les modals (`SettingsModal`, `GenerationModal`, `DeleteConfirmModal`) ne se ferment qu'en cliquant le bouton X ou l'overlay. Appuyer sur `Escape` ne fait rien. C'est une violation du standard UX et de l'accessibilité WCAG. → `useEffect` avec keydown handler ajouté à tous les modals.

- [x] 44. **Pas de `aria-label` ni de `role` sur les boutons d'action** : Les icônes Lucide dans les boutons (Trash2, Edit3, Play) n'ont pas de `aria-label`. Un lecteur d'écran ne peut pas comprendre le bouton. Chaque bouton icône doit avoir un `aria-label` descriptif. → `aria-label` ajoutés sur les boutons thème et paramètres dans Navbar.

- [x] 45. **Le scrollbar custom ne fonctionne que sur WebKit** : `index.css:10-25` personnalise le scrollbar uniquement avec les pseudo-éléments `::-webkit-scrollbar*`. Firefox utilise `scrollbar-width` et `scrollbar-color`. Le style ne sera pas cohérent entre navigateurs. → `scrollbar-width` et `scrollbar-color` ajoutés pour Firefox.

- [x] 46. **Pas de lazy loading des composants de jeux** : `TeacherDashboard.jsx` et `StudentDashboard.jsx` importent tous les jeux (`QuizGame`, `PuzzleGame`, `SequencingGame`) en statique. Avec plus de types de jeux, le bundle initial sera gonflé. Il faut utiliser `React.lazy()` + `Suspense`. → `React.lazy()` + `Suspense` ajoutés dans TeacherDashboard et StudentDashboard. Chaque jeu est maintenant un chunk séparé.

- [x] 47. **Pas de Error Boundary** : Si un composant de jeu plante (JSON mal formé, state corrompu), l'application entière crash sans recovery. Il faut un `ErrorBoundary` wrapper autour des routes pour afficher un message d'erreur plutôt qu'un écran blanc. → `ErrorBoundary.jsx` créé et wrappé autour des routes dans `App.jsx`.

- [x] 48. **Pas de breadcrumb pour les routes imbriquées** : `/teacher/analytics` est une sous-route de `/teacher` mais il n'y a aucun fil d'Ariane. L'utilisateur ne sait pas toujours où il se trouve dans la hiérarchie de navigation. → Fil d'Ariane ajouté dans le Navbar avec navigation cliquable.

- [x] 49. **Pas de PWA ni de service worker** : L'application ne peut pas être installée sur un téléphone ni fonctionner hors-ligne. Pour des collégiens avec une connectivité intermittente, un manifest PWA basique améliorerait l'expérience. → `manifest.json` créé et lié dans `index.html`.

- [x] 50. **Absence de test unitaire ou d'intégration** : Le projet n'a aucun framework de test configuré (ni Jest, ni Vitest). Les composants critiques comme le store ou le calcul d'XP ne sont pas testés. Un bug dans `submitGameResult` pourrait corrompre toutes les données. → Vitest configuré avec 11 tests unitaires sur `useGameStore` (addGame, removeGame, updateGame, submitGameResult, resetAnalytics, resetAll, addStudent, level scaling, concept analytics).

### Espace Élève (Student Experience)

- [ ] 51. **Pas d'animation de confettis sur la complétion** : Les écrans de victoire (`QuizGame.jsx:45-58`, etc.) sont statiques avec juste un emoji. Pour des adolescents, un effet de confettis CSS ou une animation Lottie transformerait une victoire plate en moment mémorable.

- [ ] 52. **Pas de mode sombre animé** : Le toggle thème (`useTheme.js:10`) fait un `classList.toggle` instantané sans transition. Un `transition` CSS sur `background-color` et `color` rendrait le changement de thème plus fluide et professionnel.

- [ ] 53. **Pas de partage ni de screenshot des résultats** : Quand un élève obtient un bon score, il ne peut pas le partager avec ses camarades. Un bouton "Partager" ou "Capturer" avec une image stylisée du score serait très viral chez les adolescents.

- [ ] 54. **Pas de profil élève personnalisable** : Les élèves ont juste un nom en dur ("Amina El Amrani"). Pas d'avatar, pas de photo, pas de personnalisation. Un système d'avatars ou au moins de choix de pseudo rendrait l'expérience plus personnelle.

- [ ] 55. **Pas d'indicateur de mode hors-ligne** : Si l'élève perd sa connexion, l'application ne le prévient pas. Les appels API échoueront silencieusement. Un badge "Hors-ligne" avec fallback sur les données localStorage serait utile.

- [ ] 56. **Le menu mobile n'a pas d'animation** : `Navbar.jsx:141-168` le menu hamburger s'ouvre/ferme instantanément. Un slide-down ou fade-in donnerait un sentiment de qualité. L'absence de fermeture automatique après sélection est aussi un problème UX.

- [ ] 57. **Pas de longueur maximale sur l'input du ChatBot** : `ChatBot.jsx:91-98` l'input n'a pas de `maxLength`. Un élève pourrait coller un texte énorme qui dépasserait les limites de l'API Gemini et provoquerait une erreur obscure.

- [ ] 58. **Pas de timestamp sur les messages du ChatBot** : Les conversations n'ont aucune indication temporelle. L'élève ne sait pas quand il a posé une question. Un simple `HH:MM` à côté de chaque message améliorerait la lisibilité.

- [ ] 59. **Pas de suggestion de questions prédéfinies** : L'input du ChatBot est vide. Pour des débutants, ajouter des "quick replies" ou des questions suggérées ("Qu'est-ce qu'un algorithme ?", "Comment fonctionne une RAM ?") réduirait la friction d'utilisation.

- [ ] 60. **Pas de progression cumulative visible** : Le "Ma Progression" dans `StudentDashboard.jsx:106-119` affiche juste le niveau et le nombre de défis complétés. Il manque un graphique d'évolution dans le temps, un historique de scores, ou une visualisation de maîtrise par concept pour motiver l'élève à progresser.
