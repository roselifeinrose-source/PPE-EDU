import { useState, useEffect, useRef } from 'react'
import { Radio, Users, Trophy, TrendingUp, Clock, X, Play, Square } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function SessionDashboard({ gameId, onClose }) {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)
  const activeSession = useGameStore((s) => s.activeSession)
  const startSession = useGameStore((s) => s.startSession)
  const addSessionResult = useGameStore((s) => s.addSessionResult)
  const endSession = useGameStore((s) => s.endSession)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  const game = games.find((g) => g.id === gameId)
  const sessionStudents = activeSession?.results || []

  useEffect(() => {
    if (!activeSession) {
      startSession(gameId)
    }
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [gameId, activeSession, startSession])

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const avgScore = sessionStudents.length
    ? Math.round(sessionStudents.reduce((sum, r) => sum + r.score, 0) / sessionStudents.length)
    : 0

  const handleEnd = () => {
    clearInterval(timerRef.current)
    endSession()
    onClose?.()
  }

  const simulateResult = () => {
    const unplayed = students.filter((s) => !sessionStudents.find((r) => r.studentId === s.id))
    if (unplayed.length === 0) return
    const student = unplayed[Math.floor(Math.random() * unplayed.length)]
    const score = Math.floor(Math.random() * 60) + 40
    addSessionResult(student.id, score, 50)
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <Radio size={20} className="text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Session en Direct</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{game?.title || 'Jeu inconnu'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={simulateResult}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Play size={14} /> Simuler un score
          </button>
          <button
            onClick={handleEnd}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Square size={14} /> Terminer
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <Clock size={16} className="mx-auto text-slate-400 dark:text-slate-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatTime(elapsed)}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Durée</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <Users size={16} className="mx-auto text-indigo-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{sessionStudents.length}/{students.length}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Terminé</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <TrendingUp size={16} className="mx-auto text-emerald-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{avgScore}%</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Score Moyen</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <Trophy size={16} className="mx-auto text-amber-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{sessionStudents.filter((r) => r.score >= 80).length}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Excellents</div>
        </div>
      </div>

      {sessionStudents.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Scores en temps réel</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {[...sessionStudents].reverse().map((result, i) => {
              const student = students.find((s) => s.id === result.studentId)
              return (
                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 text-xs animate-in slide-in-from-right">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                      {student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">{student?.name || 'Inconnu'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${result.score >= 75 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 w-8 text-right">{result.score}%</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium w-10 text-right">+{result.xpGained}XP</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sessionStudents.length === 0 && (
        <div className="text-center py-8">
          <Radio size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">En attente des résultats...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Les scores apparaîtront ici en temps réel</p>
        </div>
      )}
    </div>
  )
}
