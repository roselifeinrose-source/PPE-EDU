import { useState } from 'react'
import { Brain, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Calendar, Lightbulb, TrendingUp, RotateCcw } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { analyzeClassPerformance } from '../utils/aiService'

const priorityConfig = {
  haute: { label: 'Haute', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' },
  moyenne: { label: 'Moyenne', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' },
  basse: { label: 'Basse', cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600' },
}

function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.basse
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export default function AIAnalytics() {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isSimulation, setIsSimulation] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('insights')
  const [expandedPlan, setExpandedPlan] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await analyzeClassPerformance(games, students)
      setResult(res.data)
      setIsSimulation(res.isSimulation)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'insights', label: 'Observations', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommandations', icon: Lightbulb },
    { id: 'plan', label: 'Plan de révision', icon: Calendar },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Analytics avancés avec l'IA</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analyse des patterns d'erreur · Suggestions de révision</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              title="Relancer l'analyse"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <><Sparkles size={13} className="animate-pulse" /> Analyse en cours...</>
            ) : (
              <><Sparkles size={13} /> Analyser avec l'IA</>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-5 py-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
              <Brain size={24} className="text-violet-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
              <Sparkles size={10} className="text-white animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">L'IA analyse les données de votre classe...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Identification des patterns d'erreurs et génération de recommandations</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-400" style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="px-5 py-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty / prompt state */}
      {!result && !loading && !error && (
        <div className="px-5 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/40 flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-violet-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Analyse IA de la classe</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            L'IA analyse les scores, les concepts difficiles et les performances par élève pour générer des recommandations pédagogiques personnalisées.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {['Observations', 'Recommandations', 'Plan de révision'].map((f) => (
              <div key={f} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {f === 'Observations' && <TrendingUp size={14} className="text-slate-400" />}
                  {f === 'Recommandations' && <Lightbulb size={14} className="text-slate-400" />}
                  {f === 'Plan de révision' && <Calendar size={14} className="text-slate-400" />}
                </div>
                <span className="text-[10px] text-slate-400">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Simulation badge */}
          {isSimulation && (
            <div className="mx-5 mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">Mode simulation — résultats basés sur les données locales (pas d'API Gemini).</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 mt-4 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all duration-200 -mb-px ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Insights tab */}
          {activeTab === 'insights' && (
            <div className="p-5 space-y-3">
              {(result.insights || []).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <span className="text-2xl shrink-0 mt-0.5">{insight.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{insight.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations tab */}
          {activeTab === 'recommendations' && (
            <div className="p-5 space-y-3">
              {(result.recommendations || []).map((rec, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">{rec.action}</p>
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Revision plan tab */}
          {activeTab === 'plan' && result.revisionPlan && (
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Calendar size={15} className="text-indigo-500" />
                {result.revisionPlan.title}
              </h4>
              <div className="space-y-3">
                {(result.revisionPlan.weeks || []).map((week, i) => {
                  const isOpen = expandedPlan === i
                  return (
                    <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedPlan(isOpen ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{week.week}</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">{week.focus}</div>
                        </div>
                        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                          <ul className="mt-3 space-y-2">
                            {(week.activities || []).map((act, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                                <span className="leading-relaxed">{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
