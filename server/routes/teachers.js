import { Router } from 'express'
import { readJSON, writeJSON } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

function stripPassword(obj) {
  // eslint-disable-next-line no-unused-vars
  const { password: _, ...rest } = obj
  return rest
}

router.get('/', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const db = readJSON('teacher.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const teachers = db.teachers.map(stripPassword)
    res.json(teachers)
  } catch (err) {
    console.error('GET /api/teachers:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.get('/me', verifyToken, (req, res) => {
  try {
    const db = readJSON('teacher.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const teacher = db.teachers.find((t) => t.id === req.user.id)
    if (!teacher) return res.status(404).json({ error: 'Enseignant non trouvé' })
    res.json(stripPassword(teacher))
  } catch (err) {
    console.error('GET /api/teachers/me:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.put('/me', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Accès refusé' })
    const db = readJSON('teacher.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const idx = db.teachers.findIndex((t) => t.id === req.user.id)
    if (idx === -1) return res.status(404).json({ error: 'Enseignant non trouvé' })
    const { name, subject, avatar, password } = req.body
    if (name) db.teachers[idx].name = name
    if (subject) db.teachers[idx].subject = subject
    if (avatar) db.teachers[idx].avatar = avatar
    if (password) db.teachers[idx].password = password
    writeJSON('teacher.json', db)
    res.json(stripPassword(db.teachers[idx]))
  } catch (err) {
    console.error('PUT /api/teachers/me:', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

export default router
