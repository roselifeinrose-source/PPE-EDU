import { useState, useEffect } from 'react'
import { Maximize, Minimize, Users, Trophy, TrendingUp, Radio } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { getLevel } from '../constants'

export default function PresentationMode({ gameId, onClose }) {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)
  const activeSession = useGameStore((s) => s.activeSession)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const game = games.find((g) => g.id === gameId)
  const results = activeSession?.results || []

  const avgScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0

  const sortedResults = [...results].sort((a, b) => b.score - a.score)
  const topStudents = sortedResults.slice(0, 5)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-auto">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Plein écran"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-all"
        >
          Quitter
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm mb-4">
            <Radio size={14} className="text-red-400 animate-pulse" />
            <span>Session en direct</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{game?.title || 'Quiz en cours'}</h1>
          <p className="text-lg text-white/60">{game?.topic || ''} &middot; {results.length}/{students.length} élèves ont répondu</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 text-center backdrop-blur-sm">
            <Users size={28} className="mx-auto text-indigo-400 mb-2" />
            <div className="text-4xl font-bold">{results.length}</div>
            <div className="text-sm text-white/60 mt-1">Réponses</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center backdrop-blur-sm">
            <TrendingUp size={28} className="mx-auto text-emerald-400 mb-2" />
            <div className="text-4xl font-bold">{avgScore}%</div>
            <div className="text-sm text-white/60 mt-1">Score Moyen</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 text-center backdrop-blur-sm">
            <Trophy size={28} className="mx-auto text-amber-400 mb-2" />
            <div className="text-4xl font-bold">{results.filter((r) => r.score >= 80).length}</div>
            <div className="text-sm text-white/60 mt-1">Excellents</div>
          </div>
        </div>

        {topStudents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">Top 5</h2>
            <div className="space-y-3 max-w-2xl mx-auto">
              {topStudents.map((result, i) => {
                const student = students.find((s) => s.id === result.studentId)
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl px-5 py-3 backdrop-blur-sm">
                    <span className="text-2xl w-8 text-center">{medals[i] || `${i + 1}.`}</span>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold">
                      {student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{student?.name || 'Inconnu'}</div>
                      <div className="text-sm text-white/60">Niveau {getLevel(student?.totalXP || 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{result.score}%</div>
                      <div className="text-sm text-indigo-400">+{result.xpGained} XP</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {results.length === 0 && (
          <div className="text-center py-16">
            <Radio size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-xl text-white/40">En attente des résultats...</p>
            <p className="text-sm text-white/30 mt-2">Les scores s'afficheront ici en temps réel</p>
          </div>
        )}
      </div>
    </div>
  )
}
