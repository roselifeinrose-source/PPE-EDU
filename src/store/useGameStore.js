import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { XP_PER_LEVEL } from '../constants'
import { studentAPI, gameAPI } from '../api/apiService'

const DEFAULT_STUDENTS = [
  { id: 's1', name: 'Amina El Amrani', totalXP: 1250, level: 5, completedGames: [], bestScores: {}, groupId: 'g1', avatar: { emoji: '🐱', color: 'from-pink-500 to-rose-500', accessory: 'glasses' } },
  { id: 's2', name: 'Youssef Benali', totalXP: 890, level: 3, completedGames: [], bestScores: {}, groupId: 'g1', avatar: { emoji: '🐼', color: 'from-indigo-500 to-purple-500', accessory: 'none' } },
  { id: 's3', name: 'Mehdi Ouazzani', totalXP: 450, level: 2, completedGames: [], bestScores: {}, groupId: 'g2', avatar: { emoji: '🦊', color: 'from-amber-500 to-orange-500', accessory: 'none' } },
]

const DEFAULT_GAMES = [
  {
    id: 'g1',
    createdAt: '2025-01-15T10:00:00.000Z',
    title: "Les Composants de l'Ordinateur",
    subject: 'Informatique',
    topic: 'Architecture',
    gameType: 'quiz',
    difficulty: 'medium',
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
    createdAt: '2025-01-16T10:00:00.000Z',
    title: 'Associez les Périphériques',
    subject: 'Informatique',
    topic: 'Architecture',
    gameType: 'puzzle',
    difficulty: 'easy',
    content: {
      pairs: [
        { id: 'p1', left: 'Clavier', right: "Périphérique d'entrée" },
        { id: 'p2', left: 'Écran', right: 'Périphérique de sortie' },
        { id: 'p3', left: 'Disque Dur', right: 'Stockage' },
      ],
    },
    analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
  },
]

const DEFAULT_GROUPS = [
  { id: 'g1', name: '6ème A', color: '#6366f1' },
  { id: 'g2', name: '6ème B', color: '#10b981' },
]

const ACHIEVEMENT_DEFS = [
  { id: 'first_win', label: '1ère Victoire', desc: 'Complétez votre premier jeu', icon: '🏆', condition: (s) => s.completedGames.length >= 1 },
  { id: 'perfect_score', label: 'Score Parfait', desc: 'Obtenez 100% dans un jeu', icon: '⭐', condition: (s) => s.completedGames.some((g) => g.score === 100) },
  { id: 'five_games', label: 'Joueur Assidu', desc: 'Complétez 5 parties', icon: '🎮', condition: (s) => s.completedGames.length >= 5 },
  { id: 'ten_games', label: 'Vétéran', desc: 'Complétez 10 parties', icon: '🎖️', condition: (s) => s.completedGames.length >= 10 },
  { id: 'level5', label: 'Montée en puissance', desc: 'Atteignez le niveau 5', icon: '🚀', condition: (s) => s.level >= 5 },
  { id: 'level10', label: 'Expert', desc: 'Atteignez le niveau 10', icon: '💎', condition: (s) => s.level >= 10 },
  { id: 'streak3', label: 'En feu!', desc: '3 jours consécutifs de jeu', icon: '🔥', condition: (s) => (s.dailyStreak || 0) >= 3 },
  { id: 'xp500', label: 'Collecteur XP', desc: 'Accumulez 500 XP', icon: '⚡', condition: (s) => s.totalXP >= 500 },
  { id: 'xp1000', label: 'Maître XP', desc: 'Accumulez 1000 XP', icon: '💫', condition: (s) => s.totalXP >= 1000 },
  { id: 'daily_hero', label: 'Héros Quotidien', desc: 'Complétez un défi quotidien', icon: '📅', condition: (s) => (s.dailyChallengesCompleted || 0) >= 1 },
]

function checkAchievements(student) {
  const current = student.achievements || []
  const newOnes = []
  for (const def of ACHIEVEMENT_DEFS) {
    if (!current.find((a) => a.id === def.id) && def.condition(student)) {
      newOnes.push({ id: def.id, unlockedAt: new Date().toISOString() })
    }
  }
  return newOnes
}

function getRewardTier(totalXP) {
  if (totalXP >= 3000) return { tier: 'diamant', label: 'Diamant', icon: '💎', color: 'cyan' }
  if (totalXP >= 1500) return { tier: 'or', label: 'Or', icon: '🥇', color: 'amber' }
  if (totalXP >= 500) return { tier: 'argent', label: 'Argent', icon: '🥈', color: 'slate' }
  return { tier: 'bronze', label: 'Bronze', icon: '🥉', color: 'orange' }
}

function isRateLimited(playTimestamps) {
  const now = Date.now()
  const hourAgo = now - 3600000
  const recentPlays = (playTimestamps || []).filter((t) => t > hourAgo)
  return recentPlays.length >= 10
}

const useGameStore = create(
  persist(
    (set) => ({
      students: DEFAULT_STUDENTS,
      games: DEFAULT_GAMES,
      groups: DEFAULT_GROUPS,
      activityLogs: [],
      fogMode: false,
      activeSession: null,
      pendingGrades: [],
      challenges: [],
      activityFeed: [],
      mentorPairs: [],

      syncFromAPI: async () => {
        try {
          const [studentData, games] = await Promise.all([
            studentAPI.getAll(),
            gameAPI.getAll(),
          ])
          set({
            students: studentData.students.length > 0 ? studentData.students : DEFAULT_STUDENTS,
            groups: studentData.groups.length > 0 ? studentData.groups : DEFAULT_GROUPS,
            games: games.length > 0 ? games : DEFAULT_GAMES,
          })
        } catch (err) {
          console.warn('API sync failed, using local data:', err.message)
        }
      },

      addStudent: (student) =>
        set((state) => {
          const newStudent = { id: `s${Date.now()}`, name: student.name, totalXP: 0, level: 1, completedGames: [], bestScores: {}, groupId: student.groupId || null, achievements: [], dailyStreak: 0, lastDailyDate: null, dailyChallengesCompleted: 0, playTimestamps: [], avatar: { emoji: '👤', color: 'from-slate-400 to-slate-600', accessory: 'none' }, preferences: { theme: 'dark', sound: true } }
          studentAPI.create({ name: student.name, groupId: student.groupId }).catch(console.error)
          const logs = [{ id: `log${Date.now()}`, action: 'student_added', details: student.name, timestamp: new Date().toISOString() }, ...state.activityLogs].slice(0, 200)
          return { students: [...state.students, newStudent], activityLogs: logs }
        }),

      removeStudent: (studentId) =>
        set((state) => {
          studentAPI.remove(studentId).catch(console.error)
          return { students: state.students.filter((s) => s.id !== studentId) }
        }),

      updateStudentAvatar: (studentId, avatar) =>
        set((state) => {
          studentAPI.update(studentId, { avatar }).catch(console.error)
          return { students: state.students.map((s) => (s.id === studentId ? { ...s, avatar } : s)) }
        }),

      addGame: (game) =>
        set((state) => {
          gameAPI.create(game).catch(console.error)
          const logs = [{ id: `log${Date.now()}`, action: 'game_created', details: game.title, timestamp: new Date().toISOString() }, ...state.activityLogs].slice(0, 200)
          return { games: [...state.games, game], activityLogs: logs }
        }),

      removeGame: (gameId) =>
        set((state) => {
          gameAPI.remove(gameId).catch(console.error)
          const game = state.games.find((g) => g.id === gameId)
          const logs = [{ id: `log${Date.now()}`, action: 'game_deleted', details: game?.title || gameId, timestamp: new Date().toISOString() }, ...state.activityLogs].slice(0, 200)
          return { games: state.games.filter((g) => g.id !== gameId), activityLogs: logs }
        }),

      duplicateGame: (gameId) =>
        set((state) => {
          const original = state.games.find((g) => g.id === gameId)
          if (!original) return state
          const copy = {
            ...JSON.parse(JSON.stringify(original)),
            id: 'g' + Date.now(),
            createdAt: new Date().toISOString(),
            title: original.title + ' (copie)',
            analytics: { attempts: 0, averageScore: 0, failedConcepts: [], conceptAnalytics: {} },
          }
          gameAPI.create(copy).catch(console.error)
          return { games: [...state.games, copy] }
        }),

      archiveGame: (gameId) =>
        set((state) => {
          const game = state.games.find((g) => g.id === gameId)
          if (game) gameAPI.update(gameId, { archived: !game.archived }).catch(console.error)
          return { games: state.games.map((g) => (g.id !== gameId ? g : { ...g, archived: !g.archived })) }
        }),

      updateGame: (gameId, updates) =>
        set((state) => {
          gameAPI.update(gameId, updates).catch(console.error)
          return { games: state.games.map((g) => (g.id !== gameId ? g : { ...g, ...updates })) }
        }),

      submitGameResult: (studentId, gameId, score, xpGained, failedConceptNames = [], allConceptNames = []) =>
        set((state) => {
          gameAPI.submitResult(gameId, score, xpGained).catch(console.error)
          const students = state.students.map((s) => {
            if (s.id !== studentId) return s
            if (isRateLimited(s.playTimestamps)) return s
            const totalXP = s.totalXP + xpGained
            const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
            const completedGames = [...s.completedGames, { gameId, score, xpGained, date: new Date().toISOString() }]
            const bestScores = { ...s.bestScores }
            if (!bestScores[gameId] || score > bestScores[gameId]) {
              bestScores[gameId] = score
            }
            const today = new Date().toDateString()
            const lastDate = s.lastDailyDate
            const dailyStreak = lastDate === today ? (s.dailyStreak || 0) : lastDate === new Date(Date.now() - 86400000).toDateString() ? (s.dailyStreak || 0) + 1 : 1
            const updatedS = { ...s, totalXP, level, completedGames, bestScores, dailyStreak, lastDailyDate: today, playTimestamps: [...(s.playTimestamps || []), Date.now()] }
            const newAchievements = checkAchievements(updatedS)
            const achievements = [...(s.achievements || []), ...newAchievements]
            return { ...updatedS, achievements }
          })
          const games = state.games.map((g) => {
            if (g.id !== gameId) return g
            const attempts = g.analytics.attempts + 1
            const averageScore = Math.round(((g.analytics.averageScore * g.analytics.attempts) + score) / attempts * 100) / 100
            const existingFailed = g.analytics.failedConcepts || []
            const failedConcepts = [...new Set([...existingFailed, ...failedConceptNames])]
            const conceptAnalytics = { ...(g.analytics.conceptAnalytics || {}) }
            for (const concept of allConceptNames) {
              if (!conceptAnalytics[concept]) conceptAnalytics[concept] = { attempts: 0, successes: 0 }
              conceptAnalytics[concept].attempts += 1
            }
            for (const concept of allConceptNames) {
              if (!failedConceptNames.includes(concept)) {
                conceptAnalytics[concept].successes += 1
              }
            }
            return { ...g, analytics: { ...g.analytics, attempts, averageScore, failedConcepts, conceptAnalytics } }
          })
          return { students, games }
        }),

      resetAnalytics: () =>
        set((state) => ({
          games: state.games.map((g) => ({
            ...g,
            analytics: { attempts: 0, averageScore: 0, failedConcepts: [], conceptAnalytics: {} },
          })),
        })),

      resetAll: () =>
        set((state) => ({
          games: state.games.map((g) => ({
            ...g,
            analytics: { attempts: 0, averageScore: 0, failedConcepts: [], conceptAnalytics: {} },
          })),
          students: state.students.map((s) => ({ ...s, totalXP: 0, level: 1, completedGames: [], bestScores: {} })),
        })),

      addGroup: (group) =>
        set((state) => {
          studentAPI.addGroup({ name: group.name, color: group.color }).catch(console.error)
          return { groups: [...state.groups, { id: `grp${Date.now()}`, name: group.name, color: group.color || '#6366f1' }] }
        }),

      removeGroup: (groupId) =>
        set((state) => {
          studentAPI.removeGroup(groupId).catch(console.error)
          return {
            groups: state.groups.filter((g) => g.id !== groupId),
            students: state.students.map((s) => (s.groupId === groupId ? { ...s, groupId: null } : s)),
          }
        }),

      assignStudentToGroup: (studentId, groupId) =>
        set((state) => {
          studentAPI.update(studentId, { groupId }).catch(console.error)
          return { students: state.students.map((s) => (s.id === studentId ? { ...s, groupId } : s)) }
        }),

      submitStudentQuiz: (studentId, studentName, title, topic, questions) =>
        set((state) => {
          const newQuiz = {
            id: `g_stud_${Date.now()}`,
            createdAt: new Date().toISOString(),
            title,
            subject: 'Informatique',
            topic,
            gameType: 'quiz',
            difficulty: 'easy',
            content: { questions },
            analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
            isStudentCreated: true,
            createdBy: studentId,
            createdByName: studentName,
            approved: false
          }
          gameAPI.create(newQuiz).catch(console.error)
          const feed = { id: `f${Date.now()}`, type: 'quiz_submitted', studentId, studentName, detail: `a partagé un nouveau jeu : "${title}" (en attente de validation) 💡`, timestamp: new Date().toISOString() }
          return {
            games: [...state.games, newQuiz],
            activityFeed: [feed, ...state.activityFeed].slice(0, 100)
          }
        }),

      approveStudentQuiz: (gameId) =>
        set((state) => {
          gameAPI.update(gameId, { approved: true }).catch(console.error)
          const game = state.games.find((g) => g.id === gameId)
          const feed = game ? { id: `f${Date.now()}`, type: 'quiz_approved', studentId: game.createdBy, studentName: game.createdByName, detail: `Le jeu de ${game.createdByName} : "${game.title}" a été approuvé par l'enseignant ! 🎉`, timestamp: new Date().toISOString() } : null
          return {
            games: state.games.map((g) => g.id === gameId ? { ...g, approved: true } : g),
            activityFeed: feed ? [feed, ...state.activityFeed].slice(0, 100) : state.activityFeed
          }
        }),

      logActivity: (action, details) =>
        set((state) => ({
          activityLogs: [{ id: `log${Date.now()}`, action, details, timestamp: new Date().toISOString() }, ...state.activityLogs].slice(0, 200),
        })),

      toggleFogMode: () =>
        set((state) => ({ fogMode: !state.fogMode })),

      startSession: (gameId) =>
        set(() => ({ activeSession: { gameId, startedAt: new Date().toISOString(), results: [] } })),

      addSessionResult: (studentId, score, xpGained) =>
        set((state) => {
          if (!state.activeSession) return state
          return {
            activeSession: {
              ...state.activeSession,
              results: [...state.activeSession.results, { studentId, score, xpGained, date: new Date().toISOString() }],
            },
          }
        }),

      endSession: () =>
        set(() => ({ activeSession: null })),

      submitOpenAnswer: (studentId, gameId, questionId, question, answer, hint) =>
        set((state) => {
          const student = state.students.find((s) => s.id === studentId)
          const grade = {
            id: `pg${Date.now()}`,
            studentId,
            studentName: student?.name || studentId,
            gameId,
            questionId,
            question,
            answer,
            hint: hint || '',
            timestamp: new Date().toISOString(),
          }
          return { pendingGrades: [...state.pendingGrades, grade] }
        }),

      gradeAnswer: (gradeId, score) =>
        set((state) => {
          const grade = state.pendingGrades.find((g) => g.id === gradeId)
          if (!grade) return state
          const xp = Math.round((score / 100) * 30)
          const students = state.students.map((s) => {
            if (s.id !== grade.studentId) return s
            const totalXP = s.totalXP + xp
            const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
            const completedGames = [...s.completedGames, { gameId: grade.gameId, score, xpGained: xp, date: new Date().toISOString(), openEnded: true, questionId: grade.questionId }]
            return { ...s, totalXP, level, completedGames }
          })
          const logs = [{ id: `log${Date.now()}`, action: 'manual_grade', details: `${grade.studentName} — Q: "${grade.question.slice(0, 40)}" → ${score}%`, timestamp: new Date().toISOString() }, ...state.activityLogs].slice(0, 200)
          return {
            pendingGrades: state.pendingGrades.filter((g) => g.id !== gradeId),
            students,
            activityLogs: logs,
          }
        }),

      sendChallenge: (fromId, toId, gameId) =>
        set((state) => {
          const fromStudent = state.students.find((s) => s.id === fromId)
          const challenge = { id: `ch${Date.now()}`, fromId, toId, gameId, status: 'pending', fromScore: null, toScore: null, createdAt: new Date().toISOString() }
          const feed = { id: `f${Date.now()}`, type: 'challenge_sent', studentId: fromId, studentName: fromStudent?.name || fromId, detail: 'a envoyé un défi', timestamp: new Date().toISOString() }
          return { challenges: [...state.challenges, challenge], activityFeed: [feed, ...state.activityFeed].slice(0, 100) }
        }),

      resolveChallenge: (challengeId, studentId, score) =>
        set((state) => {
          const student = state.students.find((s) => s.id === studentId)
          const challenges = state.challenges.map((c) => {
            if (c.id !== challengeId) return c
            if (c.fromId === studentId) return { ...c, fromScore: score, status: c.toScore !== null ? 'resolved' : 'accepted' }
            if (c.toId === studentId) return { ...c, toScore: score, status: c.fromScore !== null ? 'resolved' : 'accepted' }
            return c
          })
          const feed = { id: `f${Date.now()}`, type: 'challenge_resolved', studentId, studentName: student?.name || studentId, detail: `a joué le défi avec ${score}%`, timestamp: new Date().toISOString() }
          return { challenges, activityFeed: [feed, ...state.activityFeed].slice(0, 100) }
        }),

      completeDailyChallenge: (studentId) =>
        set((state) => {
          const students = state.students.map((s) => {
            if (s.id !== studentId) return s
            const today = new Date().toDateString()
            if (s.lastDailyDate === today) return s
            return { ...s, dailyChallengesCompleted: (s.dailyChallengesCompleted || 0) + 1, lastDailyDate: today }
          })
          return { students }
        }),

      saveGameVersion: (gameId) =>
        set((state) => {
          const game = state.games.find((g) => g.id === gameId)
          if (!game) return state
          const version = { savedAt: new Date().toISOString(), content: JSON.parse(JSON.stringify(game.content)), title: game.title, topic: game.topic }
          const updated = { versions: [version, ...(game.versions || [])].slice(0, 5) }
          gameAPI.update(gameId, updated).catch(console.error)
          return {
            games: state.games.map((g) => g.id !== gameId ? g : { ...g, ...updated }),
          }
        }),

      restoreGameVersion: (gameId, versionIndex) =>
        set((state) => {
          const game = state.games.find((g) => g.id === gameId)
          if (!game || !game.versions?.[versionIndex]) return state
          const v = game.versions[versionIndex]
          const updates = { content: JSON.parse(JSON.stringify(v.content)), title: v.title, topic: v.topic }
          gameAPI.update(gameId, updates).catch(console.error)
          return {
            games: state.games.map((g) => g.id !== gameId ? g : { ...g, ...updates }),
          }
        }),

      setMentorPairing: (mentorId, menteeId) =>
        set((state) => ({
          mentorPairs: [
            ...state.mentorPairs.filter((p) => p.mentorId !== mentorId && p.menteeId !== menteeId),
            { mentorId, menteeId, createdAt: new Date().toISOString() }
          ],
        })),

      removeMentorPairing: (mentorId) =>
        set((state) => ({
          mentorPairs: state.mentorPairs.filter((p) => p.mentorId !== mentorId),
        })),

      addFeedEvent: (type, studentId, studentName, detail) =>
        set((state) => {
          const feed = { id: `f${Date.now()}`, type, studentId, studentName, detail, timestamp: new Date().toISOString() }
          return { activityFeed: [feed, ...state.activityFeed].slice(0, 100) }
        }),
    }),
    {
      name: 'ppe-game-store',
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          console.warn('ppe-game-store: corrupted localStorage, resetting to defaults')
          localStorage.removeItem('ppe-game-store')
          useGameStore.setState({ students: DEFAULT_STUDENTS, games: DEFAULT_GAMES })
          return
        }
        if (!Array.isArray(state.games) || !Array.isArray(state.students)) {
          console.warn('ppe-game-store: invalid data shape, resetting to defaults')
          localStorage.removeItem('ppe-game-store')
          useGameStore.setState({ students: DEFAULT_STUDENTS, games: DEFAULT_GAMES })
        }
      },
    }
  )
)

export { ACHIEVEMENT_DEFS, getRewardTier, checkAchievements }
export default useGameStore
