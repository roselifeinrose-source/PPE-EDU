import { useState } from 'react'
import { BarChart3, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function SessionComparison() {
  const games = useGameStore((s) => s.games)
  const [period1Start, setPeriod1Start] = useState('')
  const [period1End, setPeriod1End] = useState('')
  const [period2Start, setPeriod2Start] = useState('')
  const [period2End, setPeriod2End] = useState('')

  const filterByPeriod = (start, end) => {
    if (!start || !end) return []
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return games.filter((g) => {
      if (!g.createdAt) return false
      const created = new Date(g.createdAt).getTime()
      return created >= s && created <= e
    })
  }

  const p1Games = filterByPeriod(period1Start, period1End)
  const p2Games = filterByPeriod(period2Start, period2End)

  const p1Avg = p1Games.length ? Math.round(p1Games.reduce((s, g) => s + g.analytics.averageScore, 0) / p1Games.length) : 0
  const p2Avg = p2Games.length ? Math.round(p2Games.reduce((s, g) => s + g.analytics.averageScore, 0) / p2Games.length) : 0
  const p1Attempts = p1Games.reduce((s, g) => s + g.analytics.attempts, 0)
  const p2Attempts = p2Games.reduce((s, g) => s + g.analytics.attempts, 0)

  const diff = p2Avg - p1Avg
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'

  const hasData = p1Games.length > 0 && p2Games.length > 0

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-indigo-500" />
        Comparaison entre Périodes
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Période 1</p>
          <div className="flex gap-1.5">
            <input type="date" value={period1Start} onChange={(e) => setPeriod1Start(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="date" value={period1End} onChange={(e) => setPeriod1End(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Période 2</p>
          <div className="flex gap-1.5">
            <input type="date" value={period2Start} onChange={(e) => setPeriod2Start(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="date" value={period2End} onChange={(e) => setPeriod2End(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Période 1</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{p1Avg}%</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">{p1Attempts} tentative{p1Attempts !== 1 ? 's' : ''}</div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight size={20} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Période 2</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{p2Avg}%</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">{p2Attempts} tentative{p2Attempts !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 py-2 rounded-lg ${
            trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20' : trend === 'down' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-900/50'
          }`}>
            {trend === 'up' && <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />}
            {trend === 'down' && <TrendingDown size={16} className="text-red-600 dark:text-red-400" />}
            {trend === 'same' && <Minus size={16} className="text-slate-400" />}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-emerald-700 dark:text-emerald-300' : trend === 'down' ? 'text-red-700 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {trend === 'up' && `+${diff}% de progression`}
              {trend === 'down' && `${diff}% de régression`}
              {trend === 'same' && 'Aucun changement'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
          Sélectionnez deux périodes avec des données pour comparer.
        </p>
      )}
    </div>
  )
}
