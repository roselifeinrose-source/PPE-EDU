export const gameTemplates = [
  {
    id: 't1',
    title: 'Introduction à l\'algorithmique',
    topic: 'Algorithmique',
    gameType: 'sequencing',
    description: 'Remettre dans l\'ordre les étapes de résolution d\'un problème',
    steps: [
      { id: 't1_s1', order: 1, text: 'Analyser le problème' },
      { id: 't1_s2', order: 2, text: 'Concevoir un algorithme' },
      { id: 't1_s3', order: 3, text: 'Écrire le programme' },
      { id: 't1_s4', order: 4, text: 'Tester et déboguer' },
      { id: 't1_s5', order: 5, text: 'Maintenir le logiciel' },
    ],
  },
  {
    id: 't2',
    title: 'Les variables en programmation',
    topic: 'Programmation',
    gameType: 'quiz',
    description: 'Quiz sur les bases des variables',
    questions: [
      { id: 't2_q1', question: 'Qu\'est-ce qu\'une variable ?', options: ['Une valeur qui change', 'Un espace mémoire nommé', 'Un type de donnée', 'Une fonction'], correctIndex: 1, concept: 'Variables' },
      { id: 't2_q2', question: 'Lequel de ces noms de variable est valide ?', options: ['2variable', 'ma variable', 'monAge', 'var!'], correctIndex: 2, concept: 'Variables' },
    ],
  },
  {
    id: 't3',
    title: 'Types de données',
    topic: 'Programmation',
    gameType: 'puzzle',
    description: 'Associer chaque type de donnée à son exemple',
    pairs: [
      { id: 't3_p1', left: 'Entier (int)', right: '42' },
      { id: 't3_p2', left: 'Réel (float)', right: '3.14' },
      { id: 't3_p3', left: 'Chaîne (string)', right: '"Bonjour"' },
      { id: 't3_p4', left: 'Booléen (bool)', right: 'true' },
    ],
  },
  {
    id: 't4',
    title: 'Les structures conditionnelles',
    topic: 'Algorithmique',
    gameType: 'quiz',
    description: 'Quiz sur les conditions (si/sinon)',
    questions: [
      { id: 't4_q1', question: 'Que fait "si (age >= 18)" ?', options: ['Vérifie si age vaut 18', 'Vérifie si age est supérieur ou égal à 18', 'Vérifie si age est inférieur à 18', 'Vérifie si age est différent de 18'], correctIndex: 1, concept: 'Conditions' },
      { id: 't4_q2', question: 'Quel mot-clé suit "si" pour le cas contraire ?', options: ['alors', 'sinon', 'car', 'mais'], correctIndex: 1, concept: 'Conditions' },
    ],
  },
  {
    id: 't5',
    title: 'Les boucles',
    topic: 'Algorithmique',
    gameType: 'sequencing',
    description: 'Ordonner les étapes d\'une boucle',
    steps: [
      { id: 't5_s1', order: 1, text: 'Initialiser le compteur' },
      { id: 't5_s2', order: 2, text: 'Vérifier la condition' },
      { id: 't5_s3', order: 3, text: 'Exécuter le bloc d\'instructions' },
      { id: 't5_s4', order: 4, text: 'Incrémenter le compteur' },
    ],
  },
  {
    id: 't6',
    title: 'Les réseaux informatiques',
    topic: 'Réseaux',
    gameType: 'sequencing',
    description: 'Les couches du modèle OSI',
    steps: [
      { id: 't6_s1', order: 1, text: 'Couche 1: Physique' },
      { id: 't6_s2', order: 2, text: 'Couche 2: Liaison de données' },
      { id: 't6_s3', order: 3, text: 'Couche 3: Réseau' },
      { id: 't6_s4', order: 4, text: 'Couche 4: Transport' },
      { id: 't6_s5', order: 5, text: 'Couche 5: Session' },
      { id: 't6_s6', order: 6, text: 'Couche 6: Présentation' },
      { id: 't6_s7', order: 7, text: 'Couche 7: Application' },
    ],
  },
  {
    id: 't7',
    title: 'Sécurité informatique',
    topic: 'Sécurité',
    gameType: 'quiz',
    description: 'Quiz sur les bases de la sécurité',
    questions: [
      { id: 't7_q1', question: 'Qu\'est-ce qu\'un mot de passe fort ?', options: ['123456', 'mon-chat', 'Tr0ub4dor&3', 'password'], correctIndex: 2, concept: 'Sécurité' },
      { id: 't7_q2', question: 'À quoi sert un pare-feu ?', options: ['Accélérer Internet', 'Filtrer le trafic réseau', 'Stocker des fichiers', 'Afficher des vidéos'], correctIndex: 1, concept: 'Réseaux' },
    ],
  },
  {
    id: 't8',
    title: 'Bases de données',
    topic: 'Bases de données',
    gameType: 'puzzle',
    description: 'Associer les termes de bases de données à leur définition',
    pairs: [
      { id: 't8_p1', left: 'Table', right: 'Ensemble de lignes et colonnes' },
      { id: 't8_p2', left: 'Clé primaire', right: 'Identifiant unique d\'une ligne' },
      { id: 't8_p3', left: 'Requête', right: 'Demande de données en SQL' },
      { id: 't8_p4', left: 'Champ', right: 'Colonne d\'une table' },
    ],
  },
  {
    id: 't9',
    title: 'Texte à trous: Sécurité informatique',
    topic: 'Sécurité',
    gameType: 'cloze',
    description: 'Complète le texte sur la sécurité en ligne',
    content: {
      text: 'Un mot de passe [blank1] doit contenir au moins 12 caractères avec des majuscules, des chiffres et des symboles. Le [blank2] est une technique utilisée par des pirates pour voler vos identifiants via de faux emails. Pour naviguer en sécurité, vérifie toujours la présence du [blank3] dans la barre d\'adresse. Enfin, ne partage jamais tes [blank4] personnels avec des inconnus en ligne.',
      blanks: {
        blank1: {
          correct: 'fort',
          options: ['fort', 'faible', 'court'],
        },
        blank2: {
          correct: 'phishing',
          options: ['phishing', 'pare-feu', 'virus'],
        },
        blank3: {
          correct: 'cadenas',
          options: ['cadenas', 'logo', 'menu'],
        },
        blank4: {
          correct: 'identifiants',
          options: ['identifiants', 'jeux', 'photos'],
        },
      },
    },
  },
]

export const templateTopics = [...new Set(gameTemplates.map((t) => t.topic))]
