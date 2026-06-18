import { GoogleGenAI } from '@google/genai'
import { getLevel } from '../constants'

const ai = import.meta.env.VITE_GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })
  : null

function buildPrompt(text, gameType) {
  if (gameType === 'quiz') {
    return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère un quiz de 5 questions à choix multiples (4 options) en français.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Quiz: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0
      }
    ]
  }
}

Cours :
${text}`
  }

  if (gameType === 'puzzle') {
    return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère 5 paires d'associations (concept → définition) en français.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Puzzle: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "pairs": [
      {
        "id": "p1",
        "left": "Concept",
        "right": "Définition"
      }
    ]
  }
}

Cours :
${text}`
  }

  if (gameType === 'memory') {
    return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère exactement 6 paires de termes associés pour un jeu de Memory (concept court <-> définition courte) en français.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Memory: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "pairs": [
      {
        "id": "m1",
        "left": "Concept court (max 3 mots)",
        "right": "Définition courte (max 8 mots)"
      }
    ]
  }
}

Cours :
${text}`
  }

  if (gameType === 'cloze') {
    return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère un texte à trous (3 à 5 trous maximum) en français. Les balises de trous dans la clé "text" doivent être nommées [blank1], [blank2], [blank3], etc. et être présentes dans le texte.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Texte à trous: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "text": "Le texte explicatif court contenant des balises du type [blank1] et [blank2].",
    "blanks": {
      "blank1": {
        "correct": "mot correct",
        "options": ["mot correct", "distracteur 1", "distracteur 2"]
      },
      "blank2": {
        "correct": "autre mot",
        "options": ["autre mot", "distracteur A", "distracteur B"]
      }
    }
  }
}

Cours :
${text}`
  }

  if (gameType === 'dropping') {
    return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère un jeu de tri par catégorie. L'élève fait tomber des éléments dans les bonnes catégories. Tu dois avoir 3 à 5 catégories et 6 à 10 éléments à trier.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Tri: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "items": [
      { "id": "i1", "name": "Nom court de l'élément (max 4 mots)", "category": "id_categorie" }
    ],
    "categories": [
      { "id": "id_categorie", "label": "Nom de la catégorie" }
    ]
  }
}

Chaque élément doit avoir un "category" qui correspond exactement à un "id" de catégorie.

Cours :
${text}`
  }

  return `Tu es un professeur d'informatique pour collégiens marocains. À partir du cours suivant, génère 5 étapes à remettre dans l'ordre chronologique/logique en français.

Format JSON obligatoire (sans aucun texte avant/après) :
{
  "title": "Séquencement: [sujet du cours]",
  "topic": "[sujet]",
  "content": {
    "steps": [
      {
        "id": "s1",
        "order": 1,
        "text": "Étape à ordonner"
      }
    ]
  }
}

Cours :
${text}`
}

function validateQuizContent(content) {
  if (!content?.questions || !Array.isArray(content.questions) || content.questions.length === 0) return false
  return content.questions.every((q) =>
    q.id && q.question && Array.isArray(q.options) && q.options.length === 4 &&
    typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4
  )
}

function validatePuzzleContent(content) {
  if (!content?.pairs || !Array.isArray(content.pairs) || content.pairs.length === 0) return false
  return content.pairs.every((p) => p.id && p.left && p.right)
}

function validateSequencingContent(content) {
  if (!content?.steps || !Array.isArray(content.steps) || content.steps.length === 0) return false
  return content.steps.every((s) => s.id && s.text && typeof s.order === 'number')
}

function validateClozeContent(content) {
  if (!content?.text || !content.blanks || typeof content.text !== 'string') return false
  return Object.entries(content.blanks).every(([, data]) => 
    data.correct && Array.isArray(data.options) && data.options.includes(data.correct)
  )
}

function validateDroppingContent(content) {
  if (!content?.items || !Array.isArray(content.items) || content.items.length === 0) return false
  if (!content?.categories || !Array.isArray(content.categories) || content.categories.length === 0) return false
  return content.items.every((item) => item.id && item.name && item.category) &&
    content.categories.every((cat) => cat.id && cat.label)
}

function parseGameResponse(jsonStr, gameType) {
  const data = JSON.parse(jsonStr)

  const hasTitle = data.title && typeof data.title === 'string'
  const hasTopic = data.topic && typeof data.topic === 'string'

  if (!data.content) throw new Error('Contenu manquant dans la réponse IA')

  if (gameType === 'quiz' && !validateQuizContent(data.content)) {
    throw new Error('Format de quiz invalide: questions manquantes ou mal formées')
  }
  if (gameType === 'puzzle' && !validatePuzzleContent(data.content)) {
    throw new Error('Format de puzzle invalide: paires manquantes ou mal formées')
  }
  if (gameType === 'sequencing' && !validateSequencingContent(data.content)) {
    throw new Error('Format de séquencement invalide: étapes manquantes ou mal formées')
  }
  if (gameType === 'memory' && !validatePuzzleContent(data.content)) {
    throw new Error('Format de memory invalide: paires manquantes ou mal formées')
  }
  if (gameType === 'cloze' && !validateClozeContent(data.content)) {
    throw new Error('Format de texte à trousers invalide: texte ou trous manquants ou mal formés')
  }
  if (gameType === 'dropping' && !validateDroppingContent(data.content)) {
    throw new Error('Format de tri invalide: éléments ou catégories manquants ou mal formés')
  }

  return {
    id: 'g' + Date.now(),
    createdAt: new Date().toISOString(),
    subject: 'Informatique',
    gameType,
    title: hasTitle ? data.title : `${gameType} généré`,
    topic: hasTopic ? data.topic : 'Généré par IA',
    content: data.content,
    analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
  }
}

function mockGame(text, gameType) {
  const id = 'g' + Date.now()
  const base = {
    id,
    createdAt: new Date().toISOString(),
    subject: 'Informatique',
    topic: 'Généré par IA (simulation)',
    gameType,
    isSimulation: true,
    analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
  }

  if (gameType === 'quiz') {
    return {
      ...base,
      title: 'Quiz: Simulation',
      content: {
        questions: [
          { id: id + '_q1', question: 'Question simulée à partir du texte', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: 0 },
          { id: id + '_q2', question: 'Question simulée 2', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: 2 },
        ],
      },
    }
  }

  if (gameType === 'puzzle') {
    return {
      ...base,
      title: 'Puzzle: Simulation',
      content: {
        pairs: [
          { id: id + '_p1', left: 'Concept simulé 1', right: 'Définition 1' },
          { id: id + '_p2', left: 'Concept simulé 2', right: 'Définition 2' },
        ],
      },
    }
  }

  if (gameType === 'memory') {
    return {
      ...base,
      title: 'Memory: Simulation',
      content: {
        pairs: [
          { id: id + '_m1', left: 'CPU', right: 'Le cerveau de l\'ordinateur qui exécute les instructions.' },
          { id: id + '_m2', left: 'RAM', right: 'Mémoire de travail rapide et volatile.' },
          { id: id + '_m3', left: 'Disque Dur', right: 'Stockage permanent de grande capacité.' },
          { id: id + '_m4', left: 'Carte Mère', right: 'Le circuit imprimé principal reliant les composants.' },
          { id: id + '_m5', left: 'Clavier', right: 'Périphérique d\'entrée de texte.' },
          { id: id + '_m6', left: 'Écran', right: 'Périphérique principal de sortie visuelle.' },
        ],
      },
    }
  }

  if (gameType === 'cloze') {
    return {
      ...base,
      title: 'Texte à trous: Simulation',
      content: {
        text: 'Pour faire fonctionner l\'ordinateur, le [blank1] traite les données en les chargeant de façon temporaire dans la [blank2]. Les fichiers permanents sont quant à eux conservés dans le [blank3].',
        blanks: {
          blank1: { correct: 'processeur', options: ['processeur', 'clavier', 'réseau'] },
          blank2: { correct: 'RAM', options: ['RAM', 'ROM', 'disque dur'] },
          blank3: { correct: 'disque dur', options: ['disque dur', 'processeur', 'bus'] }
        }
      },
    }
  }

  if (gameType === 'dropping') {
    return {
      ...base,
      title: 'Tri: Simulation',
      content: {
        items: [
          { id: id + '_i1', name: 'USB', category: 'stockage' },
          { id: id + '_i2', name: 'RAM', category: 'memoire' },
          { id: id + '_i3', name: 'CPU', category: 'processeur' },
          { id: id + '_i4', name: 'Clavier', category: 'entree' },
          { id: id + '_i5', name: 'Écran', category: 'sortie' },
          { id: id + '_i6', name: 'SSD', category: 'stockage' },
        ],
        categories: [
          { id: 'stockage', label: 'P. Stockage' },
          { id: 'memoire', label: 'Mémoire' },
          { id: 'processeur', label: 'Processeur' },
          { id: 'entree', label: 'P. Entrée' },
          { id: 'sortie', label: 'P. Sortie' },
        ]
      },
    }
  }

  return {
    ...base,
    title: 'Séquencement: Simulation',
    gameType: 'sequencing',
    content: {
      steps: [
        { id: id + '_s1', order: 1, text: 'Étape simulée 1' },
        { id: id + '_s2', order: 2, text: 'Étape simulée 2' },
        { id: id + '_s3', order: 3, text: 'Étape simulée 3' },
      ],
    },
  }
}

export async function generateGameFromText(lessonText, gameType, onProgress) {
  const report = (step) => onProgress?.(step)

  if (!ai) {
    report('analyzing')
    await new Promise((r) => setTimeout(r, 600))
    report('generating')
    await new Promise((r) => setTimeout(r, 800))
    report('verifying')
    await new Promise((r) => setTimeout(r, 500))
    report('finalizing')
    await new Promise((r) => setTimeout(r, 400))
    report('done')
    return { game: mockGame(lessonText, gameType), isSimulation: true }
  }

  report('analyzing')

  const prompt = buildPrompt(lessonText, gameType)

  try {
    report('generating')
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    })

    report('verifying')
    const rawText = typeof response.text === 'function' ? response.text() : response.text
    if (!rawText) throw new Error('Réponse Gemini vide')

    report('finalizing')
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    const game = parseGameResponse(cleaned, gameType)

    report('done')
    return { game, isSimulation: false }
  } catch (err) {
    report('finalizing')
    await new Promise((r) => setTimeout(r, 600))
    report('done')
    return { game: mockGame(lessonText, gameType), isSimulation: true, simulationReason: err.message }
  }
}

// ─── Chat / Q&A ─────────────────────────────────────────────────────────────

export async function chatWithAI(userMessage, systemPrompt) {
  if (!ai) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      text: 'Mode simulation : je suis un assistant pédagogique. Configurez VITE_GEMINI_API_KEY pour des réponses réelles.',
      isSimulation: true,
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt ? `${systemPrompt}\n\nQuestion / Demande : ${userMessage}` : userMessage,
    })
    const text = typeof response.text === 'function' ? response.text() : response.text
    return { text: text || 'Pas de réponse.', isSimulation: false }
  } catch (err) {
    console.error('chatWithAI error:', err)
    return {
      text: 'Service IA temporairement indisponible (forte affluence). Veuillez réessayer plus tard.',
      isSimulation: true,
    }
  }
}

// ─── Analytics IA ────────────────────────────────────────────────────────────

function buildAnalyticsPrompt(games, students) {
  const gamesSummary = games
    .filter((g) => g.analytics.attempts > 0)
    .map((g) => `- "${g.title}" (${g.gameType}, ${g.analytics.attempts} tentatives, score moyen: ${g.analytics.averageScore}%, concepts difficiles: ${(g.analytics.failedConcepts || []).join(', ') || 'aucun'})`)
    .join('\n')

  const studentsSummary = students
    .map((s) => {
      const avg = s.completedGames.length
        ? Math.round(s.completedGames.reduce((sum, r) => sum + r.score, 0) / s.completedGames.length)
        : 0
      return `- ${s.name}: niveau ${getLevel(s.totalXP)}, ${s.totalXP} XP, ${s.completedGames.length} partie(s), score moyen ${avg}%`
    })
    .join('\n')

  return `Tu es un conseiller pédagogique expert en informatique pour collège marocain. Analyse les données de classe suivantes et génère un rapport JSON structuré.

JEUX ET PERFORMANCES :
${gamesSummary || '(aucune donnée de jeu)'}

ÉLÈVES :
${studentsSummary || '(aucun élève)'}

Génère UNIQUEMENT ce JSON (sans texte avant/après) :
{
  "insights": [
    { "icon": "📊", "title": "Titre de l'observation", "description": "Description détaillée..." },
    { "icon": "⚠️", "title": "...", "description": "..." },
    { "icon": "✅", "title": "...", "description": "..." }
  ],
  "recommendations": [
    { "priority": "haute", "action": "Action concrète à faire", "detail": "Comment la mettre en oeuvre..." },
    { "priority": "moyenne", "action": "...", "detail": "..." },
    { "priority": "basse", "action": "...", "detail": "..." }
  ],
  "revisionPlan": {
    "title": "Plan de révision 2 semaines",
    "weeks": [
      { "week": "Semaine 1", "focus": "...", "activities": ["activité 1", "activité 2"] },
      { "week": "Semaine 2", "focus": "...", "activities": ["activité 1", "activité 2"] }
    ]
  }
}`
}

function mockAnalytics(games, students) {
  const failedAll = games.flatMap((g) => g.analytics.failedConcepts || [])
  const topFailed = [...new Set(failedAll)].slice(0, 3)
  const activatedGames = games.filter((g) => g.analytics.attempts > 0)
  const avgScore = activatedGames.length
    ? Math.round(activatedGames.reduce((s, g) => s + g.analytics.averageScore, 0) / activatedGames.length)
    : 0

  const weakStudents = students.filter((s) => {
    const avg = s.completedGames.length
      ? Math.round(s.completedGames.reduce((sum, r) => sum + r.score, 0) / s.completedGames.length)
      : 0
    return avg < 60 && s.completedGames.length > 0
  })

  return {
    insights: [
      {
        icon: '📊',
        title: 'Score moyen de la classe',
        description: `La classe obtient en moyenne ${avgScore}% sur l'ensemble des activités. ${avgScore >= 70 ? 'Les performances sont satisfaisantes globalement.' : avgScore >= 50 ? 'Des améliorations sont possibles sur certains concepts.' : 'Un travail de consolidation important est nécessaire.'}`,
      },
      {
        icon: '⚠️',
        title: 'Concepts à consolider',
        description: topFailed.length
          ? `Les concepts les plus difficiles sont : ${topFailed.join(', ')}. Ces notions reviennent souvent dans les erreurs et nécessitent des révisions ciblées.`
          : 'Aucun concept particulièrement difficile identifié. Continuez sur cette lancée !',
      },
      {
        icon: '👥',
        title: 'Élèves en difficulté',
        description: weakStudents.length
          ? `${weakStudents.length} élève${weakStudents.length > 1 ? 's' : ''} (${weakStudents.map((s) => s.name.split(' ')[0]).join(', ')}) obtient${weakStudents.length > 1 ? 'ent' : ''} moins de 60%. Un suivi individualisé est recommandé.`
          : 'Tous les élèves actifs dépassent 60% de réussite. Félicitations à la classe !',
      },
    ],
    recommendations: [
      {
        priority: 'haute',
        action: topFailed.length
          ? `Créer un quiz de révision ciblé sur : ${topFailed[0]}`
          : 'Proposer des défis avancés aux élèves forts',
        detail: topFailed.length
          ? 'Utilisez le wizard IA pour générer un quiz dédié. Jouez-le en session classe pour mesurer les progrès immédiatement.'
          : 'Créez des puzzles et séquencements plus complexes pour maintenir l\'engagement.',
      },
      {
        priority: 'moyenne',
        action: weakStudents.length
          ? `Planifier une session de soutien pour ${weakStudents.length} élève${weakStudents.length > 1 ? 's' : ''}`
          : 'Introduire de nouveaux sujets pour avancer dans le programme',
        detail: weakStudents.length
          ? 'Commencez par les jeux de type "puzzle" (plus visuels) avant de revenir aux quiz. Réduisez temporairement la difficulté.'
          : 'La classe est prête pour des sujets avancés (algorithmes de tri, cryptographie basique).',
      },
      {
        priority: 'basse',
        action: 'Organiser une session de compétition entre groupes',
        detail: 'Utilisez le mode "Projeter" avec scores en direct. Créez des équipes mixtes (forts + faibles) pour favoriser l\'entraide.',
      },
    ],
    revisionPlan: {
      title: 'Plan de révision 2 semaines',
      weeks: [
        {
          week: 'Semaine 1',
          focus: topFailed.length
            ? `Consolidation : ${topFailed.slice(0, 2).join(' & ')}`
            : 'Révision générale et renforcement des acquis',
          activities: [
            'Lundi : Quiz de diagnostic (10 min) pour mesurer le niveau de départ',
            topFailed.length
              ? `Mercredi : Puzzle d'association sur "${topFailed[0]}"`
              : "Mercredi : Puzzle d'association sur les composants clés",
            'Vendredi : Session de jeu en classe avec tableau de scores en direct',
          ],
        },
        {
          week: 'Semaine 2',
          focus: 'Évaluation des progrès et introduction de nouveaux contenus',
          activities: [
            'Lundi : Séquencement — ordonnancement pour ancrer les acquis',
            'Mercredi : Quiz final pour mesurer les progrès par rapport à la semaine 1',
            'Vendredi : Bilan de classe + export PDF des résultats pour les parents',
          ],
        },
      ],
    },
  }
}

export async function analyzeClassPerformance(games, students) {
  if (!ai) {
    await new Promise((r) => setTimeout(r, 1400))
    return { data: mockAnalytics(games, students), isSimulation: true }
  }

  const prompt = buildAnalyticsPrompt(games, students)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    })
    const rawText = typeof response.text === 'function' ? response.text() : response.text
    if (!rawText) throw new Error('Réponse Gemini vide')
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    const data = JSON.parse(cleaned)
    return { data, isSimulation: false }
  } catch (err) {
    return { data: mockAnalytics(games, students), isSimulation: true, simulationReason: err.message }
  }
}
