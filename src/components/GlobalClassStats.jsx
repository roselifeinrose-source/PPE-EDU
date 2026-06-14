import { TrendingUp, Users, BarChart3, Award, AlertTriangle } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function GlobalClassStats() {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)

  const totalAttempts = games.reduce((sum, g) => sum + g.analytics.attempts, 0)
  const avgScore = games.length
    ? Math.round(games.reduce((sum, g) => sum + g.analytics.averageScore, 0) / games.filter((g) => g.analytics.attempts > 0).length) || 0
    : 0

  const studentsWithGames = students.filter((s) => s.completedGames.length > 0)
  const avgGamesPerStudent = studentsWithGames.length
    ? Math.round((studentsWithGames.reduce((sum, s) => sum + s.completedGames.length, 0) / studentsWithGames.length) * 10) / 10
    : 0

  const topStudent = [...students].sort((a, b) => b.totalXP - a.totalXP)[0]

  const hardestConcepts = games
    .filter((g) => g.analytics.attempts > 0)
    .flatMap((g) =>
      (g.analytics.failedConcepts || []).map((c) => {
        const ca = g.analytics.conceptAnalytics?.[c]
        const rate = ca ? Math.round((ca.successes / ca.attempts) * 100) : 0
        return { concept: c, gameTitle: g.title, successRate: rate, attempts: ca?.attempts || 0 }
      })
    )
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 5)

  const completionRate = students.length
    ? Math.round((studentsWithGames.length / students.length) * 100)
    : 0

  const stats = [
    { label: 'Taux de Complétion', value: `${completionRate}%`, icon: Users, color: 'indigo', desc: `${studentsWithGames.length}/${students.length} élèves actifs` },
    { label: 'Score Moyen Classe', value: `${avgScore}%`, icon: TrendingUp, color: 'emerald', desc: `${totalAttempts} tentatives au total` },
    { label: 'Jeux par Élève', value: avgGamesPerStudent, icon: BarChart3, color: 'amber', desc: 'Moyenne des parties jouées' },
    { label: 'Meilleur Élève', value: topStudent?.name?.split(' ')[0] || '—', icon: Award, color: 'purple', desc: topStudent ? `${topStudent.totalXP} XP · Niveau ${topStudent.level}` : 'Aucune donnée' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-indigo-500" />
        Statistiques Globales de la Classe
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorMap = {
            indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
            emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          }
          return (
            <div key={stat.label} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorMap[stat.color]}`}>
                  <Icon size={14} />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{stat.desc}</div>
            </div>
          )
        })}
      </div>

      {hardestConcepts.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-500" />
            Concepts les Plus Difficiles
          </h4>
          <div className="space-y-1.5">
            {hardestConcepts.map((fc, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 truncate">{fc.concept}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fc.successRate < 50 ? 'bg-red-500' : fc.successRate < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${fc.successRate}%` }}
                    />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 w-8 text-right">{fc.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
