# 🔴 Priorité : Haute (High)

* [x] **Ajouter la section "Concepts Mal Maîtrisés" :** Sur la page *Analytiques*, il y a de la place sous "Performances par Jeu". C'est l'endroit parfait pour afficher la liste basée sur `failedConcepts` corrigée lors de notre réaudit (ex: *"Algorithmes: Boucles - 33% de réussite"*). Sans cela, l'enseignant n'a pas de retour direct sur *quoi* réexpliquer en classe.
* [x] **Créer des états "À vide" (Empty States) explicites :** Actuellement, toutes les statistiques affichent `0` tentative et `0%`. Pour la soutenance, si aucune partie n'a été jouée, remplace visuellement les barres de progression vides par un petit badge ou un texte gris clair : *"Aucune tentative enregistrée pour le moment"*. Cela évitera l'effet "graphique cassé" ou incomplet devant le jury.
* [x] **Sécuriser la suppression d'un jeu :** Le bouton rouge `Supprimer` sur les cartes de jeu ne doit pas effacer le contenu instantanément. Ajoute une boîte de dialogue de confirmation (Modal ou `confirm()` en JavaScript) : *"Êtes-vous sûr de vouloir supprimer ce jeu ? Toutes les statistiques associées seront perdues."*

---

## 🟡 Priorité : Moyenne (Medium)

* [x] **Uniformiser la navigation de la page Analytiques :** Sur la première capture, l'onglet "Analytiques" est actif dans la Navbar, mais juste en dessous, il y a un lien `← Retour au tableau de bord`. C'est une double navigation un peu contradictoire. Si c'est une sous-page, retire l'onglet de la Navbar principale. Si c'est un onglet principal, retire le bouton retour.
* [x] **Améliorer la lisibilité des KPI (Cartes de statistiques) :** Les cartes du haut ("Jeux Créés", "Élèves Actifs", etc.) manquent un tout petit peu de contraste visuel. Tu pourrais ajouter une légère couleur de fond pastel ou une bordure colorée subtile aux icônes (ex: fond bleu très clair pour l'icône Livre, vert très clair pour les Élèves) pour dynamiser le regard.
* [x] **Rendre les barres de progression des jeux plus parlantes :** Sur la page *Analytiques*, sous "Performances par Jeu", les lignes bleues très fines représentent le score. Si le score est à 0%, la ligne est presque invisible. Donne-leur une hauteur minimale fixe (ex: `h-2` avec un fond gris clair `bg-slate-100`) pour qu'on voie bien qu'il s'agit d'une jauge de progression vide.

---

## 🔵 Priorité : Basse (Low)

* [x] **Remplacer l'icône de l'onglet Analytiques :** L'icône actuelle dans la Navbar ressemble à un écrou/engrenage (souvent associé aux paramètres/Settings). Pour l'onglet "Analytiques", une icône de graphique à barres (`BarChart3`) ou de lignes de tendance (`TrendingUp`) de Lucide-React serait beaucoup plus intuitive.
* [x] **Ajouter un bouton d'action rapide dans les Analytiques :** Sur la page *Analytiques*, un bouton pour "Réinitialiser les statistiques" (lié à un reset local de Zustand) permettrait à l'enseignant de remettre les compteurs à zéro facilement pendant une démonstration en direct.
* [x] **Aligner les badges de types de jeux :** Sur le tableau de bord, les badges `Quiz` (violet) et `Puzzle` (bleu) sont top. Pense à harmoniser précisément leur taille et leurs marges pour qu'ils s'alignent parfaitement au millimètre près avec le titre du sujet en dessous.

---

### 💡 Le Conseil Bonus pour ta Soutenance

Génère manuellement dans ton store Zustand **une ou deux tentatives fictives** juste avant de passer devant le jury. Voir ces graphiques s'animer avec un vrai score (ex: 75% de moyenne sur les composants de l'ordinateur) transformera ton interface statique en une plateforme vivante et ultra-convaincante !
