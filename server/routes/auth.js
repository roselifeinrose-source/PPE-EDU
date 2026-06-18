import { Router } from 'express'
import { readJSON, writeJSON } from '../db.js'
import { signToken } from '../middleware/auth.js'
import { log } from '../logger.js'

const router = Router()

router.post('/signup', (req, res) => {
  try {
    const { name, email, password, subject } = req.body
    log.debug('AUTH-SIGNUP', 'Received', { name, email })
    if (!name || !email || !password) {
      log.warn('AUTH-SIGNUP', 'Missing fields', { name, email, hasPassword: !!password })
      return res.status(400).json({ error: 'Champs obligatoires manquants' })
    }
    const db = readJSON('teacher.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    if (db.teachers.find((t) => t.email === email)) {
      log.warn('AUTH-SIGNUP', 'Duplicate email', { email })
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }
    const teacher = {
      id: 't' + Date.now(),
      name,
      email,
      password,
      subject: subject || 'Informatique',
      avatar: { emoji: '👨‍🏫', color: 'from-indigo-500 to-purple-500' },
      createdAt: new Date().toISOString(),
    }
    db.teachers.push(teacher)
    writeJSON('teacher.json', db)
    log.ok('AUTH-SIGNUP', 'Teacher created', { id: teacher.id, name: teacher.name })
    const token = signToken({ id: teacher.id, role: 'teacher', name: teacher.name })
    res.status(201).json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email, subject: teacher.subject, avatar: teacher.avatar } })
  } catch (err) {
    log.err('AUTH-SIGNUP', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

router.post('/login', (req, res) => {
  try {
    const { email, password, role } = req.body

    if (role === 'student') {
      const { studentId, name } = req.body
      log.debug('AUTH-LOGIN-STUDENT', 'Received', { studentId, name })
      const db = readJSON('student.json') || { students: [] }
      log.debug('AUTH-LOGIN-STUDENT', 'DB loaded', { count: db.students.length })
      let student
      if (studentId) {
        student = db.students.find((s) => s.id === studentId)
        log.debug('AUTH-LOGIN-STUDENT', 'Lookup by ID', { studentId, found: !!student })
      } else if (name) {
        student = db.students.find((s) => s.name.toLowerCase() === name.toLowerCase())
        log.debug('AUTH-LOGIN-STUDENT', 'Lookup by name', { name, found: !!student })
      }
      if (!student) {
        log.warn('AUTH-LOGIN-STUDENT', 'Not found', { studentId, name, totalStudents: db.students.length })
        return res.status(401).json({ error: 'Élève non trouvé' })
      }
      log.ok('AUTH-LOGIN-STUDENT', 'Logged in', { id: student.id, name: student.name })
      const token = signToken({ id: student.id, role: 'student', name: student.name })
      const safe = { id: student.id, name: student.name, totalXP: student.totalXP, level: student.level, completedGames: student.completedGames, bestScores: student.bestScores, groupId: student.groupId, avatar: student.avatar, preferences: student.preferences }
      return res.json({ token, student: safe })
    }

    log.debug('AUTH-LOGIN-TEACHER', 'Received', { email })
    if (!email || !password) {
      log.warn('AUTH-LOGIN-TEACHER', 'Missing fields', { email, hasPassword: !!password })
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }
    const db = readJSON('teacher.json')
    if (!db) return res.status(500).json({ error: 'Erreur de base de données' })
    const teacher = db.teachers.find((t) => t.email === email && t.password === password)
    if (!teacher) {
      log.warn('AUTH-LOGIN-TEACHER', 'Invalid credentials', { email })
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }
    log.ok('AUTH-LOGIN-TEACHER', 'Logged in', { id: teacher.id, name: teacher.name })
    const token = signToken({ id: teacher.id, role: 'teacher', name: teacher.name })
    res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email, subject: teacher.subject, avatar: teacher.avatar } })
  } catch (err) {
    log.err('AUTH-LOGIN', err.message)
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
})

export default router
