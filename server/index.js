import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import teacherRoutes from './routes/teachers.js'
import studentRoutes from './routes/students.js'
import gameRoutes from './routes/games.js'
import { log } from './logger.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
  log.info('HTTP', `${req.method} ${req.url}`)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/games', gameRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use((err, _req, res) => {
  log.err('UNCAUGHT', err.message, err.stack)
  res.status(500).json({ error: 'Erreur interne du serveur' })
})

app.listen(PORT, () => {
  log.ok('SERVER', `Running on http://localhost:${PORT}`)
})
