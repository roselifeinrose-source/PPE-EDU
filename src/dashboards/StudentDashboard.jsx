import { useState } from 'react'
import { BookOpen, Puzzle, ListOrdered, Zap, ArrowRight, GraduationCap } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'
import QuizGame from '../games/QuizGame'
import PuzzleGame from '../games/PuzzleGame'
import SequencingGame from '../games/SequencingGame'
import Leaderboard from '../components/Leaderboard'
import { XP_PER_LEVEL } from '../constants'

const gameIcons = { quiz: BookOpen, puzzle: Puzzle, sequencing: ListOrdered }

export default function StudentDashboard() {
  const { currentStudentId } = useAuthStore()
  const { students, games } = useGameStore()
  const [activeGameId, setActiveGameId] = useState(null)

  const student = students.find((s) => s.id === currentStudentId)
  if (!student) return <p className="text-slate-500 dark:text-slate-400">Sélectionnez un élève dans la barre de navigation.</p>

  const xpProgress = ((student.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null

  if (activeGame) {
    if (activeGame.gameType === 'quiz') return <QuizGame game={activeGame} onBack={() => setActiveGameId(null)} />
    if (activeGame.gameType === 'puzzle') return <PuzzleGame game={activeGame} onBack={() => setActiveGameId(null)} />
    if (activeGame.gameType === 'sequencing') return <SequencingGame game={activeGame} onBack={() => setActiveGameId(null)} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{student.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Niveau {student.level}</p>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
              <Zap size={20} />
              <span>{student.totalXP} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{student.totalXP % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Niveau {student.level} &rarr; Niveau {student.level + 1}</p>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400" />
          Défis Disponibles
        </h2>

        <div className="grid gap-4">
          {games.map((game) => {
            const Icon = gameIcons[game.gameType] || BookOpen
            const completed = student.completedGames.find((c) => c.gameId === game.id)
            return (
              <button
                key={game.id}
                onClick={() => setActiveGameId(game.id)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-left hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-slate-100 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200">{game.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{game.topic}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                          {game.gameType === 'quiz' ? 'Quiz' : game.gameType === 'puzzle' ? 'Puzzle' : 'Séquencement'}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">+50 XP</span>
                        {completed && <span className="text-xs text-emerald-600 dark:text-emerald-400">Complété &middot; {completed.score}%</span>}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-all duration-200 shrink-0 mt-2" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <Leaderboard />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-indigo-500" />
            Ma Progression
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Niveau {student.level}</span>
                <span>{student.totalXP % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {student.completedGames.length} défi{student.completedGames.length > 1 ? 's' : ''} complété{student.completedGames.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
