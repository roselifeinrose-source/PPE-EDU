import { ArrowLeft, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/useGameStore'

export default function TeacherAnalytics() {
  const navigate = useNavigate()
  const { games, students } = useGameStore()

  const totalAttempts = games.reduce((sum, g) => sum + g.analytics.attempts, 0)
  const avgScore = games.length
    ? Math.round(games.reduce((sum, g) => sum + g.analytics.averageScore, 0) / games.length)
    : 0

  return (
    <div>
      <button onClick={() => navigate('/teacher')} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm mb-6 transition-all duration-200">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Analytiques</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <Users size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Élèves</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tentatives</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalAttempts}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <BarChart3 size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Score Moyen</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgScore}%</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Performances par Jeu</h2>
      <div className="space-y-3">
        {games.map((game) => (
          <div key={game.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-slate-900 dark:text-slate-100 font-medium text-sm">{game.title}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{game.analytics.attempts} tentative{game.analytics.attempts > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${game.analytics.averageScore}%` }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{game.analytics.averageScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
