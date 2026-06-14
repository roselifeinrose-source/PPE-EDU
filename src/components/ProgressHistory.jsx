import { useMemo } from 'react'
import { TrendingUp, BarChart3, BookOpen } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

function MiniSparkline({ data, color = '#6366f1' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 80
  const h = 28
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      })}
    </svg>
  )
}

export default function ProgressHistory() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  const { byGame, conceptData, xpOverTime } = useMemo(() => {
    if (!student) return { byGame: [], conceptData: [], xpOverTime: [] }

    // Group completed games by gameId and compute score over attempts
    const gameMap = {}
    student.completedGames.forEach((cg) => {
      if (!gameMap[cg.gameId]) gameMap[cg.gameId] = []
      gameMap[cg.gameId].push(cg.score)
    })
    const byGame = Object.entries(gameMap).map(([gameId, scores]) => {
      const game = games.find((g) => g.id === gameId)
      return { gameId, title: game?.title || gameId, scores, latest: scores[scores.length - 1], best: Math.max(...scores) }
    })

    // XP progression over time (cumulative)
    const sorted = [...student.completedGames].sort((a, b) => new Date(a.date) - new Date(b.date))
    let cum = 0
    const xpOverTime = sorted.map((cg) => { cum += cg.xpGained; return cum })

    // Concept mastery from game analytics
    const conceptData = []
    games.forEach((g) => {
      if (!g.analytics?.conceptAnalytics) return
      Object.entries(g.analytics.conceptAnalytics).forEach(([concept, data]) => {
        const existing = conceptData.find((c) => c.concept === concept)
        if (existing) {
          existing.attempts += data.attempts
          existing.successes += data.successes
        } else {
          conceptData.push({ concept, attempts: data.attempts, successes: data.successes })
        }
      })
    })

    return { byGame, conceptData, xpOverTime }
  }, [student, games])

  if (!student) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-indigo-500" />
        Historique de Progression
      </h3>

      {student.completedGames.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
          Jouez à des jeux pour voir votre progression ici !
        </div>
      ) : (
        <div className="space-y-5">
          {/* XP over time */}
          {xpOverTime.length >= 2 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <BarChart3 size={12} /> Évolution XP
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total actuel</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{student.totalXP} XP</p>
                </div>
                <MiniSparkline data={xpOverTime} color="#6366f1" />
              </div>
            </div>
          )}

          {/* Per-game scores */}
          {byGame.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen size={12} /> Scores par jeu
              </p>
              <div className="space-y-2">
                {byGame.map(({ gameId, title, scores, best }) => (
                  <div key={gameId} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{title}</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">{best}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${best >= 80 ? 'bg-emerald-500' : best >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${best}%` }}
                        />
                      </div>
                    </div>
                    {scores.length >= 2 && <MiniSparkline data={scores} color={best >= 80 ? '#10b981' : best >= 60 ? '#f59e0b' : '#ef4444'} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concept mastery */}
          {conceptData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Concepts maîtrisés</p>
              <div className="space-y-1.5">
                {conceptData.slice(0, 6).map(({ concept, attempts, successes }) => {
                  const rate = attempts > 0 ? Math.round((successes / attempts) * 100) : 0
                  return (
                    <div key={concept} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 w-28 truncate">{concept}</span>
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 w-8 text-right">{rate}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
