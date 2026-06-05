import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { XP_PER_LEVEL } from '../constants'

const useGameStore = create(
  persist(
    (set) => ({
      students: [
        { id: 's1', name: 'Amina El Amrani', totalXP: 1250, level: 5, completedGames: [] },
        { id: 's2', name: 'Youssef Benali', totalXP: 890, level: 3, completedGames: [] },
        { id: 's3', name: 'Mehdi Ouazzani', totalXP: 450, level: 2, completedGames: [] },
      ],
      games: [
        {
          id: 'g1',
          title: "Les Composants de l'Ordinateur",
          subject: 'Informatique',
          topic: 'Architecture',
          gameType: 'quiz',
          content: {
            questions: [
              { id: 'q1', question: 'Quel composant est considéré comme le "cerveau" de l\'ordinateur ?', options: ['RAM', 'CPU', 'Disque Dur', 'Carte Graphique'], correctIndex: 1, concept: 'Architecture' },
              { id: 'q2', question: 'À quoi sert la RAM ?', options: ['Stocker des fichiers', 'Exécuter des programmes', 'Afficher l\'image', 'Refroidir le PC'], correctIndex: 1, concept: 'Mémoire' },
              { id: 'q3', question: 'Quel périphérique est un périphérique d\'entrée ?', options: ['Écran', 'Imprimante', 'Clavier', 'Haut-parleur'], correctIndex: 2, concept: 'Périphériques' },
            ],
          },
          analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
        },
        {
          id: 'g2',
          title: 'Associez les Périphériques',
          subject: 'Informatique',
          topic: 'Architecture',
          gameType: 'puzzle',
          content: {
            pairs: [
              { id: 'p1', left: 'Clavier', right: "Périphérique d'entrée" },
              { id: 'p2', left: 'Écran', right: 'Périphérique de sortie' },
              { id: 'p3', left: 'Disque Dur', right: 'Stockage' },
            ],
          },
          analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
        },
      ],
      addGame: (game) => set((state) => ({ games: [...state.games, game] })),
      removeGame: (gameId) => set((state) => ({ games: state.games.filter((g) => g.id !== gameId) })),
      updateGame: (gameId, updates) =>
        set((state) => ({
          games: state.games.map((g) => (g.id !== gameId ? g : { ...g, ...updates })),
        })),
      submitGameResult: (studentId, gameId, score, xpGained, failedConceptNames = []) =>
        set((state) => {
          const students = state.students.map((s) => {
            if (s.id !== studentId) return s
            const totalXP = s.totalXP + xpGained
            const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
            return {
              ...s,
              totalXP,
              level,
              completedGames: [...s.completedGames, { gameId, score, xpGained, date: new Date().toISOString() }],
            }
          })
          const games = state.games.map((g) => {
            if (g.id !== gameId) return g
            const attempts = g.analytics.attempts + 1
            const averageScore = Math.round(((g.analytics.averageScore * g.analytics.attempts) + score) / attempts * 100) / 100
            const existingFailed = g.analytics.failedConcepts || []
            const failedConcepts = [...new Set([...existingFailed, ...failedConceptNames])]
            return { ...g, analytics: { ...g.analytics, attempts, averageScore, failedConcepts } }
          })
          return { students, games }
        }),
    }),
    { name: 'ppe-game-store' }
  )
)

export default useGameStore
