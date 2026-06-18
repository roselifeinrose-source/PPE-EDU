import { Router } from 'express'
import { readJSON, writeJSON } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

router.get('/', verifyToken, (req, res) => {
  try {
    const db = readJSON('games.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    res.json(db.games)
  } catch (err) {
    console.error('GET /api/games:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.get('/:id', verifyToken, (req, res) => {
  try {
    const db = readJSON('games.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const game = db.games.find((g) => g.id === req.params.id)
    if (!game) return res.status(404).json({ error: 'Jeu non trouvé' })
    res.json(game)
  } catch (err) {
    console.error('GET /api/games/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.post('/', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Seul un enseignant peut créer des jeux' })
    const db = readJSON('games.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const game = {
      id: 'g' + Date.now(),
      createdAt: new Date().toISOString(),
      ...req.body,
      analytics: req.body.analytics || { attempts: 0, averageScore: 0, failedConcepts: [] },
    }
    db.games.push(game)
    writeJSON('games.json', db)
    res.status(201).json(game)
  } catch (err) {
    console.error('POST /api/games:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.put('/:id', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const db = readJSON('games.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const idx = db.games.findIndex((g) => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Jeu non trouvé' })
    db.games[idx] = { ...db.games[idx], ...req.body, id: req.params.id }
    writeJSON('games.json', db)
    res.json(db.games[idx])
  } catch (err) {
    console.error('PUT /api/games/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.delete('/:id', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const db = readJSON('games.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const idx = db.games.findIndex((g) => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Jeu non trouvé' })
    db.games.splice(idx, 1)
    writeJSON('games.json', db)
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/games/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.post('/:id/result', verifyToken, (req, res) => {
  try {
    const { score, xpGained } = req.body

    const db = readJSON('games.json')
    if (db) {
      const game = db.games.find((g) => g.id === req.params.id)
      if (game) {
        game.analytics.attempts += 1
        game.analytics.averageScore = Math.round(((game.analytics.averageScore * (game.analytics.attempts - 1)) + score) / game.analytics.attempts * 100) / 100
        writeJSON('games.json', db)
      }
    }

    const sdb = readJSON('student.json')
    if (sdb) {
      const sidx = sdb.students.findIndex((s) => s.id === req.user.id)
      if (sidx !== -1) {
        const s = sdb.students[sidx]
        s.totalXP = (s.totalXP || 0) + (xpGained || 0)
        s.level = Math.floor(s.totalXP / 300) + 1
        s.completedGames = [...(s.completedGames || []), { gameId: req.params.id, score, xpGained: xpGained || 0, date: new Date().toISOString() }]
        if (!s.bestScores || !s.bestScores[req.params.id] || score > s.bestScores[req.params.id]) {
          s.bestScores = { ...(s.bestScores || {}), [req.params.id]: score }
        }
        const today = new Date().toDateString()
        const lastDate = s.lastDailyDate
        s.dailyStreak = lastDate === today ? (s.dailyStreak || 0) : lastDate === new Date(Date.now() - 86400000).toDateString() ? (s.dailyStreak || 0) + 1 : 1
        s.lastDailyDate = today
        writeJSON('student.json', sdb)
      }
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('POST /api/games/:id/result:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

export default router
