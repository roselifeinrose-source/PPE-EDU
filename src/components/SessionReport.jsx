import { FileDown, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { getLevel } from '../constants'

export default function SessionReport() {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)

  const gamesWithData = games.filter((g) => g.analytics.attempts > 0)

  const totalAttempts = games.reduce((sum, g) => sum + g.analytics.attempts, 0)
  const avgScore = gamesWithData.length
    ? Math.round(gamesWithData.reduce((sum, g) => sum + g.analytics.averageScore, 0) / gamesWithData.length)
    : 0

  const failedConcepts = gamesWithData.flatMap((g) =>
    (g.analytics.failedConcepts || []).map((c) => {
      const ca = g.analytics.conceptAnalytics?.[c]
      const rate = ca ? Math.round((ca.successes / ca.attempts) * 100) : 0
      return { concept: c, gameTitle: g.title, successRate: rate, attempts: ca?.attempts || 0 }
    })
  )

  const studentStats = students.map((s) => {
    const results = s.completedGames || []
    const totalScore = results.reduce((sum, r) => sum + r.score, 0)
    const avg = results.length ? Math.round(totalScore / results.length) : 0
    return { ...s, avgScore: avg, gamesPlayed: results.length }
  }).sort((a, b) => b.avgScore - a.avgScore)

  const generateReport = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

    let report = `RAPPORT DE SESSION - InforGames\n`
    report += `Date: ${dateStr}\n`
    report += `${'='.repeat(50)}\n\n`
    report += `RÉSUMÉ GLOBAL\n`
    report += `${'-'.repeat(30)}\n`
    report += `Élèves: ${students.length}\n`
    report += `Jeux actifs: ${gamesWithData.length}\n`
    report += `Total tentatives: ${totalAttempts}\n`
    report += `Score moyen: ${avgScore}%\n\n`

    report += `PERFORMANCES PAR JEU\n`
    report += `${'-'.repeat(30)}\n`
    for (const g of gamesWithData) {
      report += `• ${g.title}: ${g.analytics.averageScore}% moyen (${g.analytics.attempts} tentatives)\n`
    }

    if (failedConcepts.length > 0) {
      report += `\nCONCEPTS DIFFICILES\n`
      report += `${'-'.repeat(30)}\n`
      for (const fc of failedConcepts) {
        report += `• ${fc.concept}: ${fc.successRate}% de réussite (${fc.attempts} tentatives)\n`
      }
    }

    report += `\nCLASSEMENT DES ÉLÈVES\n`
    report += `${'-'.repeat(30)}\n`
    for (let i = 0; i < studentStats.length; i++) {
      const s = studentStats[i]
      report += `${i + 1}. ${s.name}: ${s.avgScore}% moyen, Niveau ${getLevel(s.totalXP)}, ${s.totalXP} XP, ${s.gamesPlayed} parties\n`
    }

    report += `\n${'='.repeat(50)}\nGénéré par InforGames - ${dateStr}\n`

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-inforgames-${now.toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <FileDown size={16} className="text-indigo-500" />
        Rapport de Session
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 text-center">
          <Users size={14} className="mx-auto text-indigo-500 mb-1" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{students.length}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Élèves</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 text-center">
          <TrendingUp size={14} className="mx-auto text-emerald-500 mb-1" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{avgScore}%</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Score Moyen</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 text-center">
          <AlertTriangle size={14} className="mx-auto text-amber-500 mb-1" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{failedConcepts.length}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Concepts Difficiles</div>
        </div>
      </div>

      <button
        onClick={generateReport}
        disabled={totalAttempts === 0}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 px-4 py-2.5 rounded-lg transition-all"
      >
        <FileDown size={14} /> Télécharger le Rapport
      </button>
      {totalAttempts === 0 && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
          Aucune donnée disponible pour générer un rapport.
        </p>
      )}
    </div>
  )
}
