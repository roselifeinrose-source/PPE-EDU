import { GoogleGenAI } from '@google/genai'

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

function parseGameResponse(jsonStr, gameType) {
  const data = JSON.parse(jsonStr)
  return {
    id: 'g' + Date.now(),
    subject: 'Informatique',
    gameType,
    title: data.title || `${gameType} généré`,
    topic: data.topic || 'Généré par IA',
    content: data.content,
    analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
  }
}

function mockGame(text, gameType) {
  const id = 'g' + Date.now()
  const base = {
    id,
    subject: 'Informatique',
    topic: 'Généré par IA (simulation)',
    gameType,
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

export async function generateGameFromText(lessonText, gameType) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    console.warn('Aucune clé API configurée — utilisation du mode simulation')
    await new Promise((r) => setTimeout(r, 1000))
    return mockGame(lessonText, gameType)
  }

  const prompt = buildPrompt(lessonText, gameType)
  const ai = new GoogleGenAI({ apiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    })

    const rawText = response.text
    if (!rawText) throw new Error('Réponse Gemini vide')

    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    const game = parseGameResponse(cleaned, gameType)
    return game
  } catch {
    console.warn('API Gemini indisponible, mode simulation activé.')
    await new Promise((r) => setTimeout(r, 1000))
    return mockGame(lessonText, gameType)
  }
}
