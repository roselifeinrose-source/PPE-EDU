import { useState, useRef } from 'react'
import { TrendingUp, Users, BarChart3, AlertTriangle, RotateCcw, Check, X, ChevronDown, ChevronUp, FileDown, Bot, Lightbulb, Calendar } from 'lucide-react'
import useGameStore from '../../store/useGameStore'
import MetricCard from '../../components/MetricCard'
import SessionComparison from '../../components/SessionComparison'
import SessionReport from '../../components/SessionReport'
import AIAnalytics from '../../components/AIAnalytics'
import { getLevel } from '../../constants'

const COUNTDOWN_SECONDS = 5

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
  { id: 'students', label: 'Par Élève', icon: Users },
  { id: 'ai', label: 'IA & Recommandations', icon: Bot },
]

export default function TeacherAnalyticsPage() {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)
  const resetAnalytics = useGameStore((s) => s.resetAnalytics)
  const [activeTab, setActiveTab] = useState('overview')
  const [confirmReset, setConfirmReset] = useState(false)
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const countdownRef = useRef(COUNTDOWN_SECONDS)
  const timerRef = useRef(null)

  const cancelReset = () => {
    setConfirmReset(false)
    setCountdown(COUNTDOWN_SECONDS)
    countdownRef.current = COUNTDOWN_SECONDS
    clearTimeout(timerRef.current)
  }

  const tick = () => {
    countdownRef.current -= 1
    setCountdown(countdownRef.current)
    if (countdownRef.current <= 0) {
      resetAnalytics()
      setConfirmReset(false)
      setCountdown(COUNTDOWN_SECONDS)
      countdownRef.current = COUNTDOWN_SECONDS
    } else {
      timerRef.current = setTimeout(tick, 1000)
    }
  }

  const startReset = () => {
    countdownRef.current = COUNTDOWN_SECONDS
    setCountdown(COUNTDOWN_SECONDS)
    setConfirmReset(true)
    timerRef.current = setTimeout(tick, 1000)
  }

  const totalAttempts = games.reduce((sum, g) => sum + g.analytics.attempts, 0)
  const avgScore = games.length
    ? Math.round(games.reduce((sum, g) => sum + g.analytics.averageScore, 0) / games.length)
    : 0
  const hasData = totalAttempts > 0

  const failedConcepts = games
    .filter((g) => g.analytics.attempts > 0)
    .flatMap((g) =>
      (g.analytics.failedConcepts || []).map((c) => {
        const ca = g.analytics.conceptAnalytics?.[c]
        const rate = ca ? Math.round((ca.successes / ca.attempts) * 100) : 0
        return { concept: c, gameTitle: g.title, successRate: rate, attempts: ca?.attempts || 0 }
      })
    )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytiques</h1>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard icon={Users} label="Élèves" value={students.length} color="indigo" subtitle={students.length === 0 ? 'Aucun élève inscrit' : undefined} />
            <MetricCard icon={TrendingUp} label="Tentatives" value={totalAttempts} color="emerald" subtitle={!hasData ? 'Aucune tentative' : undefined} />
            <MetricCard icon={BarChart3} label="Score Moyen" value={`${avgScore}%`} color="amber" subtitle={!hasData ? 'En attente de données' : undefined} />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performances par Jeu</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                <FileDown size={14} /> PDF
              </button>
              <button onClick={startReset} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-50 dark:hover:bg-red-900/20">
                <RotateCcw size={14} /> Réinitialiser
              </button>
            </div>
          </div>

          {confirmReset && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-red-700 dark:text-red-300">Réinitialiser les statistiques ? Les XP et niveaux ne seront pas affectés.</span>
                <button onClick={cancelReset} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><X size={16} /></button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Réinitialisation dans {countdown}s...</span>
                <button onClick={cancelReset} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg text-xs transition-all"><X size={14} /> Annuler</button>
              </div>
              {countdown > 0 && (
                <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }} />
                </div>
              )}
            </div>
          )}

          {!hasData && games.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
              <BarChart3 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune tentative enregistrée.</p>
            </div>
          )}

          {games.length > 0 && (
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-slate-900 dark:text-slate-100 font-medium text-sm">{game.title}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{game.analytics.attempts} tentative{game.analytics.attempts > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${game.analytics.averageScore}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{game.analytics.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {failedConcepts.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Concepts Mal Maîtrisés
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
                {failedConcepts.map((fc, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{fc.concept}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{fc.gameTitle}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="w-20">
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${fc.successRate < 50 ? 'bg-red-500' : fc.successRate < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${fc.successRate}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 w-10 text-right">{fc.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasData && failedConcepts.length === 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl p-4 flex items-center gap-3">
              <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Tous les concepts sont bien maîtrisés. Excellent travail !</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Students */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {students.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
              <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun élève inscrit.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => {
                const isExpanded = expandedStudent === student.id
                const gameResults = student.completedGames || []
                const totalScore = gameResults.reduce((sum, r) => sum + r.score, 0)
                const avgStudentScore = gameResults.length ? Math.round(totalScore / gameResults.length) : 0

                return (
                  <div key={student.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{student.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Niveau {getLevel(student.totalXP)} · {student.totalXP} XP · {gameResults.length} partie{gameResults.length > 1 ? 's' : ''}
                            {gameResults.length > 0 && ` · ${avgStudentScore}% moyen`}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-700">
                        {gameResults.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 py-3">Aucune partie terminée.</p>
                        ) : (
                          <div className="space-y-2 pt-3">
                            {gameResults.map((result, ri) => {
                              const game = games.find((g) => g.id === result.gameId)
                              return (
                                <div key={ri} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-700 dark:text-slate-300 truncate">{game?.title || result.gameId}</span>
                                  <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${result.score >= 75 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${result.score}%` }} />
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400 w-8 text-right">{result.score}%</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium w-10 text-right">+{result.xpGained}XP</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SessionComparison />
            <SessionReport />
          </div>
        </div>
      )}

      {/* Tab: AI */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <AIAnalytics />

          {failedConcepts.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" /> Recommandations
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Basé sur les concepts mal maîtrisés, voici les recommandations :</p>
                <div className="space-y-2">
                  {failedConcepts.map((fc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{fc.concept} ({fc.successRate}%)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jeu : {fc.gameTitle} — {fc.attempts} tentative{fc.attempts > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" /> Comparaison entre Périodes
            </h2>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">La comparaison entre périodes sera disponible après plusieurs sessions de jeu.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
