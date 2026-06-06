# IDEA.md — Idées d'Amélioration InforGames

Nouvelles fonctionnalités à implémenter, organisées par rôle et priorité.

- [x] 📝 Le "Texte à Trous" (Fill-in-the-Blanks)
- [x] 🧠 Le "Memory" Informatique
- [x] dropping material (diferrent materiel drop from the top and the student should use keyboard key make them fall in there best box for example "usb" => "p.stockage")

- [x] add drag and drop to game "like matching and puzzle" → `PuzzleGame.jsx` : drag-and-drop HTML5 complet + fallback click

---

## 🔴 Priorité : Haute (High)

### Espace Enseignant (Teacher Experience)

- [x] 1. **Création de quiz en mode pas-à-pas wizard** : Un wizard en 4 étapes (Type & Titre → Contenu → Aperçu → Récapitulatif) remplace le textarea brut. Le teacher choisit le type de jeu, la difficulté, le titre, puis colle le texte ou importe un fichier. L'IA génère et affiche un aperçu avant création. → `QuizWizard.jsx` créé et intégré.

- [x] 2. **Import de contenu depuis un fichier (PDF/DOCX/TXT)** : Un bouton "Importer un fichier" dans le wizard permet de charger un fichier .txt/.md/.csv via FileReader. Le contenu est pré-rempli dans le textarea. → Intégré dans `QuizWizard.jsx`.

- [x] 3. **Dashboard analytics en temps réel pendant une session** : Quand les élèves jouent en classe, l'enseignant verrait en direct les scores arriver (via un panneau rafraîchi toutes les 5s). Utile pour un quiz Kahoot-like en classe. → `SessionDashboard.jsx` créé avec simulation de scores en temps réel.

- [x] 4. **Groupes de classe avec affectation d'élèves** : Créer des groupes (ex: "6ème A", "6ème B") et assigner des jeux spécifiques à chaque groupe. Les analytics seraient filtrables par groupe. Permet une différenciation pédagogique. → `GroupManager.jsx` avec couleurs, ajout/suppression, assignation.

- [x] 5. **Export PDF des rapports d'analytics** : Les analytics actuels sont impressionnables mais le format PDF natif avec en-tête (logo, date, nom de la classe) serait plus professionnel pour les réunions parents-professeurs. → Bouton "Exporter PDF" ajouté (utilise `window.print()`).

- [x] 6. **Modèles de jeux prédéfinis** : Bibliothèque de 8 templates de jeux par sujet (Architecture, Algorithmique, Réseaux, Sécurité, BDD). L'enseignant choisit un template et le personnalisise. → `gameTemplates.js` (8 templates) + `TemplatePicker.jsx` intégré.

- [x] 7. **Paramétrage de la difficulté** : 3 niveaux (Facile/Moyen/Difficile) dans le wizard, influençant le prompt IA. → Intégré dans `QuizWizard.jsx`.

- [x] 8. **Comparaison entre sessions** : Dans les analytics, pouvoir comparer les performances de deux périodes (ex: "semaine 1 vs semaine 2"). Graphique d'évolution avec tendance visible. → `SessionComparison.jsx` intégré dans Analytics.

- [x] 9. **Notifications d'activité élèves** : Quand un élève atteint un nouveau niveau ou complète un jeu difficile, l'enseignant reçoit une notification discrète. Renforce le suivi. → `TeacherNotifications.jsx` avec panel dans la Navbar.

- [x] 10. **Mode présentation / projecteur** : Un bouton "Projeter" qui affiche un jeu en plein écran sur le vidéoprojecteur de la classe. Les élèves jouent sur leurs appareils, le prof voit les résultats sur le grand écran. → `PresentationMode.jsx` avec fullscreen et top 5 en direct.

### Espace Élève (Student Experience)

- [x] 11. **Classement dynamique en temps réel** : Le leaderboard se met à jour pendant une session de jeu. Quand un camarade gagne des XP, tout le monde voit le changement de position en direct. Effet "compétition" puissant.

- [x] 12. **Système de défis entre élèves** : Un élève peut défier un camarade sur un jeu spécifique. Le défi est accepté ou refusé. Les scores sont comparés directement. Très engageant pour les adolescents.

- [x] 13. **Historique détaillé de progression** : Un graphique line montrant l'évolution des scores par concept dans le temps. L'élève voit ses progrès concrètement (ex: "Architecture: 40% → 75% en 2 semaines").

- [x] 14. **Achievements débloquables** : Au-delà des badges, des achievements spéciaux avec animations (ex: "1ère victoire", "5 parties d'affilée", "Score parfait", "Concept maîtrisé"). Effet de collection qui motive.

- [x] 15. **Mode révision ciblée** : Après un quiz, proposer une session de révision ciblant uniquement les concepts mal maîtrisés. Les questions mal répondues sont reformulées et rejouées.

- [x] 16. **Avatar personnalisable avec progression** : L'avatar évolue avec le niveau. Plus l'élève monte en niveau, plus son avatar est customisable (accessoires, couleurs, animations). Motivation visuelle.

- [x] 17. **Tableau de bord personnel avec stats** : Un onglet "Mon Profil" avec : XP total, niveau, streak, badges, temps passé, concepts maîtrisés, évolution. Résumé complet de la journey.

- [x] 18. **Notifications in-app de progression** : Quand l'élève monte de niveau ou débloque un badge, un toast animé apparaît avec félicitations. Pas juste un chiffre qui change silencieusement. → `LevelUpToast.jsx` créé avec animation bounce.

- [x] 20. **Sélection de thème de jeu** : L'élève pourrait choisir un thème visuel pour son expérience (espace, forêt, océan, ville cyberpunk). Les jeux gardent le même contenu mais changent de skin. Personnalisation fun.

---

## 🟡 Priorité : Moyenne (Medium)

### Espace Enseignant (Teacher Experience)

- [x] 21. **Génération de quiz à partir d'une image/scan** : Utiliser l'API Gemini Vision pour extraire le texte d'une photo de cours ou d'un schéma. L'enseignant photographie le tableau et l'IA génère les questions automatiquement. → `ImageQuizGenerator.jsx` avec drag & drop et Gemini Vision.

- [x] 22. **Système de tags sur les jeux** : Tags personnalisables affichés sur les cartes de jeux, recherche par tags. → `tags` ajouté au modèle de jeu, affichage et recherche intégrés.

- [x] 23. **Duplication de jeux** : Bouton "Dupliquer" sur chaque jeu crée une copie avec reset des analytics. → `duplicateGame` ajouté au store.

- [x] 24. **Calendrier de publication** : Planifier la publication de jeux à une date/heures précise. Les élèves ne voient le jeu qu'à la date prévue. Utile pour les évaluations. → `PublicationCalendar.jsx` avec date picker et planification.

- [x] 25. **Statistiques globales de la classe** : Vue d'ensemble : taux de complétion moyen, temps moyen par jeu, concept le plus difficile, meilleur élève par sujet. Tableau de bord synthétique. → `GlobalClassStats.jsx` intégré dans TeacherDashboard.

- [x] 26. **Mode correction manuelle** : Pour les quiz à questions ouvertes, l'enseignant note manuellement les réponses et attribue des XP. Les questions peuvent être marquées "ouvertes" dans le wizard (aperçu). Les réponses élèves arrivent dans un panneau dédié avec slider de note (0–100) et commentaire. → `ManualGrading.jsx` + `QuizGame.jsx` + `QuizWizard.jsx` + `useGameStore.js` mis à jour.

- [x] 27. **Commentaires sur les jeux** : L'enseignant pourrait ajouter des commentaires/consignes aux jeux (ex: "Attention, ce quiz porte sur le chapitre 3"). Les élèves voient le commentaire avant de jouer. → Champ `comment` dans l'édition, affiché sur les cartes élèves.

- [x] 28. **Archivage de jeux** : Bouton "Archiver" masque un jeu sans le supprimer. Toggle "Archivés" pour les afficher/masquer. → `archiveGame` ajouté au store, bouton et filtre intégrés.

- [x] 30. **Rapport de session** : Après un quiz en classe, générer un rapport PDF avec les scores de tous les élèves, les concepts difficiles, et les recommandations. → `SessionReport.jsx` avec téléchargement TXT intégré dans Analytics.

### Espace Élève (Student Experience)

- [x] 31. **Système de récompenses progressives** : Plus l'élève joue, plus les récompenses sont importantes. Niveaux de récompense : bronze, argent, or, diamant. → `getRewardTier()` dans `useGameStore.js`, affiché dans `StudentProfile.jsx`.

- [x] 32. **Mini-jeux entre les grosses sessions** : Des mini-jeux de 30 secondes (quiz flash, puzzle rapide) pour maintenir l'attention entre les sessions longues. Gamification de la micro-révision.

- [x] 33. **Mode sombre animé** : Transition fluide quand l'élève change de thème. Pas de flash brutal. Un fondu de 300ms sur background-color et color.

- [x] 34. **Onboarding interactif** : Premier lancement : un tutoriel guidé qui explique XP, niveaux, badges, streak. 4-5 étapes avec skip possible. Réduit la confusion initiale.

- [x] 35. **Indicateur de difficulté visible** : Chaque jeu affiche une difficulté estimée (étoiles 1-3) basée sur le nombre de questions, les concepts, et le score moyen historique. → Étoiles 1-3 sur toutes les cartes de jeu (teacher + student).

- [x] 36. **Jouer encore avec score amélioré** : Les jeux complétés affichent "Rejouer pour améliorer". Le meilleur score est conservé. L'ancien score reste visible pour comparaison. → `bestScores` ajouté au store ; meilleur score affiché sur les cartes.

- [x] 37. **Feed social de progression** : Un mur de classe montrant les achievements récents de tous les élèves (niveaux, badges, scores parfaits). Effet de communauté.

- [x] 38. **Mode défis quotidiens** : Un quiz quotidien court (5 questions) avec un mini-classement. Motive le retour quotidien.

- [x] 39. **Sons et effets sonores** : Micro-interactions sonores : "ding" pour bonne réponse, "buzz" pour mauvaise, fanfare pour victoire. Améliore l'immersion.

- [x] 40. **Système d'indices** : Pour les puzzles et séquencements, un système d'indices (3 max par partie) qui révèle une lettre ou déplace une étape. Réduit la frustration.

---

## 🔵 Priorité : Basse (Low)

### Espace Enseignant (Teacher Experience)

- [x] 41. **Multi-langue** : Interface traduisible en arabe et en anglais pour les écoles multilingues du Maroc. → `translations.js` (FR/AR/EN) + `useTranslation` hook + onglet Langue dans Settings.

- [x] 42. **Thème d'entreprise** : Personnalisation du thème couleurs de toute l'interface (palette complète) pour correspondre aux couleurs de l'école. → 6 couleurs d'accent dans Settings (indigo, émeraude, ambre, rose, cyan, violet).

- [x] 43. **Mode sombre automatique** : Détecter le thème système de l'appareil et s'adapter automatiquement (prefers-color-scheme). → `useTheme.js` détecte `prefers-color-scheme` et applique le thème système.

- [x] 44. **Accessibilité renforcée** : Navigation au clavier complète, contraste WCAG AA, support lecteur d'écran, raccourcis clavier. → `role="dialog"`, `aria-label`, `aria-modal` ajoutés sur tous les modals et boutons icônes.

- [x] 47. **Logs d'activité** : Journal des actions enseignant (création, suppression, modification de jeux) pour audit et débogage. → `ActivityLogs.jsx` avec 200 logs max, triés par date.

- [x] 48. **Mode brouillard** : Quand l'enseignant active ce mode, les scores des élèves ne sont visibles que par l'enseignant (masqués sur l'écran de la classe). → `FogMode.jsx` avec toggle, leaderboard masqué côté élève.

- [x] 49. **Intégration LMS (Moodle, etc.)** : LTI ou import/export de quiz au format QTI pour interopérabilité.

- [x] 50. **Analytics avancés avec IA** : L'IA (Gemini ou mock rule-based) analyse les patterns d'erreur, les concepts difficiles et les performances par élève pour suggérer des révisions ciblées. Rapport en 3 onglets : Observations, Recommandations (avec priorité), Plan de révision 2 semaines. → `AIAnalytics.jsx` + `analyzeClassPerformance()` dans `aiService.js`.

### Espace Élève (Student Experience)

- [x] 51. **Mode avatar 3D** : Un petit avatar 3D qui réagit aux actions (saute quand l'élève gagne, pleure quand il perd). Utilisation de Three.js ou CSS 3D

- [x] 52. **Compétition inter-classes** : Un classement entre classes (6ème A vs 6ème B) avec des scores agrégés. Esprit de compétition d'équipe.

- [x] 53. **Système de mentorat** : Les élèves de niveau élevé peuvent aider les débutants. Un "tuteur" gagne des XP en aidant.

- [x] 55. **Galerie de creations** : Les élèves pourraient créer et partager leurs propres quiz avec les camarades. Modération par l'enseignant.

- [x] 56. **Mode méditation/zen** : Petit écran de respiration entre les quiz pour réduire le stress des évaluations.

- [x] 57. **Assistant vocal** : "Hey InforGames, explique-moi la RAM" — intégration Web Speech API pour les élèves qui préfèrent l'oral. → `ChatBot.jsx` avec reconnaissance vocale (fr-FR) + synthèse vocale.

- [x] 58. **Carte de progression interactive** : Une carte de type "arbre de compétences" visuel montrant les branches (sujets) et les feuilles (concepts maîtrisés).

- [x] 59. **Mode sombre automatique** : Suivre le thème système de l'appareil (prefers-color-scheme). → Même implémentation que #43, via `useTheme.js`.

- [x] 60. **Export de badges en image** : L'élève peut télécharger une image stylisée de ses badges pour la partager sur les réseaux sociaux.

---

## Idées transversales (Enseignant + Élève)

- [x] **Mode sombre animé** : Transition fluide de 300ms sur background-color et color pour tout le thème.
- [x] **PWA complète** : Service worker pour fonctionnement hors-ligne, installation sur l'écran d'accueil, notifications push.
- [x] **Analytics exports** : Export CSV/JSON des données pour analyse dans Excel/Google Sheets.
- [x] **Rate limiting côté client** : Limiter le nombre de parties par heure pour éviter l'abus.
- [x] **Versioning des jeux** : Quand un jeu est modifié, garder une version précédente accessible pour comparaison.
