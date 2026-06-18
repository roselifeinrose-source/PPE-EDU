import { Router } from 'express'
import { readJSON, writeJSON } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { log } from '../logger.js'

const router = Router()

function stripPassword(obj) {
  // eslint-disable-next-line no-unused-vars
  const { password: _, ...rest } = obj
  return rest
}

router.get('/', verifyToken, (req, res) => {
  try {
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const students = db.students.map(stripPassword)
    res.json({ students, groups: db.groups })
  } catch (err) {
    log.err('GET /api/students:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.get('/:id', verifyToken, (req, res) => {
  try {
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const student = db.students.find((s) => s.id === req.params.id)
    if (!student) return res.status(404).json({ error: 'Élève non trouvé' })
    res.json(stripPassword(student))
  } catch (err) {
    log.err('GET /api/students/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.post('/', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Seul un enseignant peut ajouter des élèves' })
    const { name, groupId } = req.body
    if (!name) return res.status(400).json({ error: 'Le nom est obligatoire' })
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const student = {
      id: 's' + Date.now(),
      name,
      password: 'student123',
      totalXP: 0,
      level: 1,
      completedGames: [],
      bestScores: {},
      groupId: groupId || null,
      achievements: [],
      dailyStreak: 0,
      lastDailyDate: null,
      dailyChallengesCompleted: 0,
      playTimestamps: [],
      avatar: { emoji: '👤', color: 'from-slate-400 to-slate-600', accessory: 'none' },
      preferences: { theme: 'dark', sound: true },
      createdAt: new Date().toISOString(),
    }
    db.students.push(student)
    writeJSON('student.json', db)
    res.status(201).json(stripPassword(student))
  } catch (err) {
    log.err('POST /api/students:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.put('/:id', verifyToken, (req, res) => {
  try {
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const idx = db.students.findIndex((s) => s.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Élève non trouvé' })
    const updates = { ...req.body }
    delete updates.password
    db.students[idx] = { ...db.students[idx], ...updates }
    writeJSON('student.json', db)
    res.json(stripPassword(db.students[idx]))
  } catch (err) {
    log.err('PUT /api/students/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.delete('/:id', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Seul un enseignant peut supprimer des élèves' })
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const idx = db.students.findIndex((s) => s.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Élève non trouvé' })
    db.students.splice(idx, 1)
    writeJSON('student.json', db)
    res.json({ ok: true })
  } catch (err) {
    log.err('DELETE /api/students/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.post('/groups', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const { name, color } = req.body
    if (!name) return res.status(400).json({ error: 'Le nom du groupe est obligatoire' })
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const group = { id: 'grp' + Date.now(), name, color: color || '#6366f1' }
    db.groups.push(group)
    writeJSON('student.json', db)
    res.status(201).json(group)
  } catch (err) {
    log.err('POST /api/students/groups:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.delete('/groups/:id', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const db = readJSON('student.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    db.groups = db.groups.filter((g) => g.id !== req.params.id)
    db.students = db.students.map((s) => s.groupId === req.params.id ? { ...s, groupId: null } : s)
    writeJSON('student.json', db)
    res.json({ ok: true })
  } catch (err) {
    log.err('DELETE /api/students/groups/:id:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

export default router
