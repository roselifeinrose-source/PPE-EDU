import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../store/useGameStore'

beforeEach(() => {
  useGameStore.setState({
    students: [
      { id: 's1', name: 'Test Student', totalXP: 100, level: 1, completedGames: [] },
    ],
    games: [
      {
        id: 'g1',
        title: 'Test Game',
        subject: 'Informatique',
        topic: 'Test',
        gameType: 'quiz',
        content: { questions: [] },
        analytics: { attempts: 0, averageScore: 0, failedConcepts: [], conceptAnalytics: {} },
      },
    ],
  })
})

describe('useGameStore', () => {
  it('adds a game', () => {
    const game = { id: 'g2', title: 'New Game', gameType: 'quiz', content: {} }
    useGameStore.getState().addGame(game)
    expect(useGameStore.getState().games).toHaveLength(2)
  })

  it('removes a game', () => {
    useGameStore.getState().removeGame('g1')
    expect(useGameStore.getState().games).toHaveLength(0)
  })

  it('updates a game', () => {
    useGameStore.getState().updateGame('g1', { title: 'Updated' })
    expect(useGameStore.getState().games[0].title).toBe('Updated')
  })

  it('submitGameResult updates student XP and level', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, [], ['Concept1'])
    const student = useGameStore.getState().students.find((s) => s.id === 's1')
    expect(student.totalXP).toBe(140)
    expect(student.level).toBe(1)
    expect(student.completedGames).toHaveLength(1)
  })

  it('submitGameResult updates game analytics', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, [], ['Concept1'])
    const game = useGameStore.getState().games.find((g) => g.id === 'g1')
    expect(game.analytics.attempts).toBe(1)
    expect(game.analytics.averageScore).toBe(80)
  })

  it('submitGameResult tracks concept analytics', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, ['FailedConcept'], ['FailedConcept', 'GoodConcept'])
    const game = useGameStore.getState().games.find((g) => g.id === 'g1')
    expect(game.analytics.conceptAnalytics['FailedConcept'].attempts).toBe(1)
    expect(game.analytics.conceptAnalytics['FailedConcept'].successes).toBe(0)
    expect(game.analytics.conceptAnalytics['GoodConcept'].attempts).toBe(1)
    expect(game.analytics.conceptAnalytics['GoodConcept'].successes).toBe(1)
  })

  it('submitGameResult updates failedConcepts', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, ['BadConcept'], ['BadConcept'])
    const game = useGameStore.getState().games.find((g) => g.id === 'g1')
    expect(game.analytics.failedConcepts).toContain('BadConcept')
  })

  it('resetAnalytics clears game analytics only', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, [], ['C1'])
    useGameStore.getState().resetAnalytics()
    const game = useGameStore.getState().games.find((g) => g.id === 'g1')
    expect(game.analytics.attempts).toBe(0)
    expect(game.analytics.averageScore).toBe(0)
    const student = useGameStore.getState().students.find((s) => s.id === 's1')
    expect(student.totalXP).toBe(140)
  })

  it('resetAll clears everything', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 80, 40, [], ['C1'])
    useGameStore.getState().resetAll()
    const game = useGameStore.getState().games.find((g) => g.id === 'g1')
    expect(game.analytics.attempts).toBe(0)
    const student = useGameStore.getState().students.find((s) => s.id === 's1')
    expect(student.totalXP).toBe(0)
    expect(student.level).toBe(1)
    expect(student.completedGames).toHaveLength(0)
  })

  it('addStudent creates a student with default values', () => {
    useGameStore.getState().addStudent({ name: 'New Kid' })
    const students = useGameStore.getState().students
    expect(students).toHaveLength(2)
    const newStudent = students.find((s) => s.name === 'New Kid')
    expect(newStudent.totalXP).toBe(0)
    expect(newStudent.level).toBe(1)
  })

  it('level scales correctly with XP', () => {
    useGameStore.getState().submitGameResult('s1', 'g1', 100, 500, [], [])
    const student = useGameStore.getState().students.find((s) => s.id === 's1')
    expect(student.totalXP).toBe(600)
    expect(student.level).toBe(3)
  })
})
